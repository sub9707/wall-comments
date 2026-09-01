import { getSafeZoneRects, getSafeZoneRect, type Rect } from "@/lib/safeZoneRect";
import { PINK_DROP_CONFIG } from "@/lib/config";

export type BubblePoint = { x: number; y: number; radiusPx: number; active: boolean; baseX: number; baseY: number };

function clampInsideViewport(x: number, y: number, radius: number): { x: number; y: number } {
  const marginW = window.innerWidth - radius - 8;
  const marginH = window.innerHeight - radius - 8;
  return {
    x: Math.max(radius + 8, Math.min(marginW, x)),
    y: Math.max(radius + 8, Math.min(marginH, y)),
  };
}

/** Pushes a resting point outside a single safe-zone rect (with padding) if it falls inside. */
function pushOutOfZone(x: number, y: number, radius: number, zone: Rect): { x: number; y: number } {
  // Extra buffer beyond the resting radius: the floating sin/cos motion
  // layered on top of baseX/baseY (up to ~floatAmplitude*1.3 in any
  // direction) isn't itself clamped, so the padding here needs to
  // absorb that drift or bubbles can visually kiss the safe-zone edge.
  const padding = radius + PINK_DROP_CONFIG.floatAmplitude * 1.5 + 40;
  const left = zone.x - padding;
  const right = zone.x + zone.width + padding;
  const top = zone.y - padding;
  const bottom = zone.y + zone.height + padding;

  if (x <= left || x >= right || y <= top || y >= bottom) {
    return { x, y };
  }

  // A zone can be tall enough (center column unioned with the footer
  // guide) that its padded top/bottom edge falls outside the viewport
  // entirely — pushing there would just get dragged back in by
  // clampInsideViewport afterward, undoing this push. Only offer an
  // edge as an escape route if it's actually reachable within the
  // viewport.
  const distLeft = left >= radius + 8 ? x - left : Infinity;
  const distRight = right <= window.innerWidth - radius - 8 ? right - x : Infinity;
  const distTop = top >= radius + 8 ? y - top : Infinity;
  const distBottom = bottom <= window.innerHeight - radius - 8 ? bottom - y : Infinity;
  const min = Math.min(distLeft, distRight, distTop, distBottom);

  if (!Number.isFinite(min)) {
    // Every edge is unreachable within the viewport — hug whichever raw
    // edge is nearest without the extra padding, better than leaving
    // the point at its original (inside-the-zone) spot.
    const raw = [
      { d: Math.abs(x - zone.x), p: { x: zone.x, y } },
      { d: Math.abs(zone.x + zone.width - x), p: { x: zone.x + zone.width, y } },
      { d: Math.abs(y - zone.y), p: { x, y: zone.y } },
      { d: Math.abs(zone.y + zone.height - y), p: { x, y: zone.y + zone.height } },
    ].sort((a, b) => a.d - b.d);
    return raw[0]!.p;
  }

  if (min === distLeft) return { x: left, y };
  if (min === distRight) return { x: right, y };
  if (min === distTop) return { x, y: top };
  return { x, y: bottom };
}

/**
 * Pushes a point outside every registered safe zone (center UI, counter
 * card, ...). A single pass isn't enough: adjacent zones' padded
 * regions can overlap, so pushing out of one zone can land the point
 * inside another — repeating the full pass converges it to a point
 * outside all of them (cheap at 2-3 zones).
 */
function clampOutsideSafeZones(x: number, y: number, radius: number): { x: number; y: number } {
  const zones = getSafeZoneRects();
  let point = { x, y };
  for (let pass = 0; pass < 6; pass++) {
    for (const zone of zones) {
      point = pushOutOfZone(point.x, point.y, radius, zone);
    }
  }
  return point;
}

const SEPARATION_ITERATIONS = 3;

/**
 * Simple O(n^2) pairwise separation among active bubbles — no physics
 * engine. Nudges each bubble's resting (base) position away from
 * overlapping neighbors, then keeps it outside every safe zone and
 * inside the viewport. The floating sin/cos motion is layered on top
 * of baseX/baseY separately, in BubbleManager's update loop.
 *
 * Pairwise separation and the safe-zone clamp can pull a bubble in
 * opposite directions — a single pass can leave it settled just inside
 * a zone. Repeating the pairwise+clamp pass a few times per frame
 * (cheap at n<=45) converges this within the same frame instead of
 * visibly oscillating across frames.
 */
export function applySeparation<T extends BubblePoint>(points: T[], dt: number): void {
  const active = points.filter((p) => p.active);
  const perIterationDt = dt / SEPARATION_ITERATIONS;

  for (let iteration = 0; iteration < SEPARATION_ITERATIONS; iteration++) {
    for (let i = 0; i < active.length; i++) {
      const a = active[i]!;
      for (let j = i + 1; j < active.length; j++) {
        const b = active[j]!;
        const dx = b.baseX - a.baseX;
        const dy = b.baseY - a.baseY;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDist = a.radiusPx + b.radiusPx + PINK_DROP_CONFIG.separationPadding;

        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          const push = overlap * PINK_DROP_CONFIG.separationStrength * perIterationDt;
          a.baseX -= nx * push;
          a.baseY -= ny * push;
          b.baseX += nx * push;
          b.baseY += ny * push;
        }
      }
    }

    for (const point of active) {
      const outside = clampOutsideSafeZones(point.baseX, point.baseY, point.radiusPx);
      const bounded = clampInsideViewport(outside.x, outside.y, point.radiusPx);
      point.baseX = bounded.x;
      point.baseY = bounded.y;
    }
  }
}

/** Finds a placement for a newly spawned bubble: near the center vicinity, outside every safe zone, without heavy overlap. */
export function findSpawnPosition<T extends BubblePoint>(points: T[], radius: number): { x: number; y: number } {
  const centerZone = getSafeZoneRect("center") ?? { x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40, width: 80, height: 80 };
  const centerX = centerZone.x + centerZone.width / 2;
  const centerY = centerZone.y + centerZone.height / 2;
  const active = points.filter((p) => p.active);

  const innerRadius = Math.hypot(centerZone.width / 2, centerZone.height / 2) + radius + 24;
  const outerRadius = Math.min(window.innerWidth, window.innerHeight) / 2 - radius - 16;

  let best: { x: number; y: number } | null = null;
  let bestScore = -Infinity;

  const attempts = 24;
  for (let i = 0; i < attempts; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = innerRadius + Math.random() * Math.max(1, outerRadius - innerRadius);
    const candidate = clampInsideViewport(centerX + Math.cos(angle) * dist, centerY + Math.sin(angle) * dist, radius);
    const outside = clampOutsideSafeZones(candidate.x, candidate.y, radius);

    let nearest = Infinity;
    for (const point of active) {
      const d = Math.hypot(outside.x - point.baseX, outside.y - point.baseY) - (radius + point.radiusPx);
      if (d < nearest) nearest = d;
    }

    const score = active.length === 0 ? 0 : nearest;
    if (score > bestScore) {
      bestScore = score;
      best = outside;
    }

    // Good enough — no need to keep searching.
    if (score > PINK_DROP_CONFIG.separationPadding * 2) break;
  }

  return best ?? { x: centerX, y: centerY + centerZone.height / 2 + radius + 40 };
}
