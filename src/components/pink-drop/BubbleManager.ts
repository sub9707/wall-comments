import type { BubbleDomPoolInstance } from "./BubbleDom";
import type { RippleLayer } from "./RippleLayer";
import { applySeparation, findSpawnPosition, type BubblePoint } from "./BubblePhysics";
import { spawnOrigin } from "@/lib/spawnOrigin";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { Comment } from "@/types/comment";

const MAX_RADIUS = PINK_DROP_CONFIG.bubbleSize.max;
const MIN_RADIUS = PINK_DROP_CONFIG.bubbleSize.min;

/** Piecewise pop-in scale curve matching the spec's 0 -> 0.5 -> 1.15 -> 1 keyframes. */
function popScaleMultiplier(t: number): number {
  if (t < 0.4) return lerp(0, 0.5, t / 0.4);
  if (t < 0.75) return lerp(0.5, 1.15, (t - 0.4) / 0.35);
  return lerp(1.15, 1, (t - 0.75) / 0.25);
}

/** Piecewise exit scale curve: 1 -> 0.8 -> 0. */
function exitScaleMultiplier(t: number): number {
  if (t < 0.5) return lerp(1, 0.8, t / 0.5);
  return lerp(0.8, 0, (t - 0.5) / 0.5);
}

/** Quick punchy "뾱" pop for a user-deleted bubble: a fast outward burst, then gone. */
function popOutScaleMultiplier(t: number): number {
  if (t < 0.3) return lerp(1, 1.3, t / 0.3);
  return lerp(1.3, 0, (t - 0.3) / 0.7);
}

function lerp(a: number, b: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return a + (b - a) * clamped;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Slow start, fast middle, slow arrival — the "premium glide" used for the travel phase. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type BubbleManager = {
  spawn: (comment: Comment, getElapsed: () => number) => void;
  update: (elapsed: number, dt: number) => void;
  clearAll: (elapsed: number) => void;
  hydrate: (comments: Comment[], elapsed: number) => void;
  removeByCommentId: (commentId: string) => void;
  updateTextByCommentId: (commentId: string, text: string, updatedAt: string) => void;
};

export function createBubbleManager(pool: BubbleDomPoolInstance, ripple: RippleLayer): BubbleManager {
  let spawnOrderCounter = 0;
  let lastElapsed = 0;

  function findSlotIndexForNewComment(): number {
    const freeIndex = pool.slots.findIndex((s) => !s.active);
    if (freeIndex !== -1) return freeIndex;
    let oldest = 0;
    for (let i = 1; i < pool.slots.length; i++) {
      if (pool.slots[i]!.spawnOrder < pool.slots[oldest]!.spawnOrder) oldest = i;
    }
    return oldest;
  }

  /** Spawns a NEW comment: pops in at the input's spawn origin, then eases out to its resting spot. */
  function placeAndActivate(index: number, comment: Comment, elapsed: number) {
    const slot = pool.slots[index]!;

    // Size is random per bubble, not tied to age or text length — every
    // bubble gets a fixed size at spawn and keeps it for its whole
    // lifetime on the wall (no shrinking as newer ones arrive).
    const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
    slot.radiusPx = 0;
    slot.targetRadiusPx = radius;

    const pos = findSpawnPosition(pool.slots as unknown as BubblePoint[], radius);
    slot.baseX = pos.x;
    slot.baseY = pos.y;
    slot.originX = spawnOrigin.x;
    slot.originY = spawnOrigin.y;
    slot.phase = Math.random() * Math.PI * 2;
    slot.speed = PINK_DROP_CONFIG.floatSpeed * (0.8 + Math.random() * 0.4);
    slot.amplitude = PINK_DROP_CONFIG.floatAmplitude * (0.7 + Math.random() * 0.6);
    slot.commentId = comment.id;
    slot.active = true;
    slot.stage = "popping";
    slot.stageStartTime = elapsed;
    slot.spawnOrder = ++spawnOrderCounter;

    slot.textInnerEl.textContent = comment.text;
    slot.el.dataset.commentId = comment.id;
    slot.el.dataset.commentText = comment.text;
    slot.el.dataset.commentCreatedAt = comment.createdAt;
    slot.el.dataset.commentUpdatedAt = comment.updatedAt;
    slot.el.style.opacity = "0";
    pool.container.appendChild(slot.el); // move to top of paint order — newest renders in front

    ripple.spawn(slot.originX, slot.originY, radius * 0.7);
  }

  function spawn(comment: Comment, getElapsed: () => number) {
    const index = findSlotIndexForNewComment();
    placeAndActivate(index, comment, getElapsed());
  }

  function hydrate(comments: Comment[], elapsed: number) {
    // Oldest first, so the most recent comment ends up as the newest (highest spawnOrder).
    const ordered = [...comments].reverse().slice(0, pool.slots.length);

    ordered.forEach((comment, index) => {
      const slot = pool.slots[index];
      if (!slot) return;

      // Random size, same as a live spawn — rehydrated history should
      // just appear already settled, no pop/travel/growth animation.
      const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);

      const pos = findSpawnPosition(pool.slots as unknown as BubblePoint[], radius);
      slot.baseX = pos.x;
      slot.baseY = pos.y;
      slot.radiusPx = radius;
      slot.targetRadiusPx = radius;
      slot.phase = Math.random() * Math.PI * 2;
      slot.speed = PINK_DROP_CONFIG.floatSpeed * (0.8 + Math.random() * 0.4);
      slot.amplitude = PINK_DROP_CONFIG.floatAmplitude * (0.7 + Math.random() * 0.6);
      slot.commentId = comment.id;
      slot.active = true;
      slot.stage = "active";
      slot.stageStartTime = elapsed;
      slot.spawnOrder = ++spawnOrderCounter;

      slot.textInnerEl.textContent = comment.text;
      slot.el.dataset.commentId = comment.id;
      slot.el.dataset.commentText = comment.text;
      slot.el.dataset.commentCreatedAt = comment.createdAt;
      slot.el.dataset.commentUpdatedAt = comment.updatedAt;
      const scale = radius / MAX_RADIUS;
      slot.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      slot.el.style.opacity = "1";
      pool.container.appendChild(slot.el);
    });
  }

  function update(elapsed: number, dt: number) {
    lastElapsed = elapsed;
    applySeparation(pool.slots as unknown as BubblePoint[], dt);

    for (let i = 0; i < pool.slots.length; i++) {
      const slot = pool.slots[i]!;
      if (slot.stage === "idle") continue;
      const stageElapsed = elapsed - slot.stageStartTime;

      let opacity = 1;
      let x: number;
      let y: number;

      if (slot.stage === "popping") {
        const t = stageElapsed / (PINK_DROP_CONFIG.spawnAnimation.popDuration / 1000);
        slot.radiusPx = slot.targetRadiusPx * popScaleMultiplier(Math.min(t, 1));
        opacity = Math.min(1, t / 0.3);
        x = slot.originX;
        y = slot.originY;
        if (t >= 1) {
          slot.stage = "traveling";
          slot.stageStartTime = elapsed;
          slot.radiusPx = slot.targetRadiusPx;
        }
      } else if (slot.stage === "traveling") {
        const t = Math.min(1, stageElapsed / (PINK_DROP_CONFIG.spawnAnimation.travelDuration / 1000));
        const eased = easeInOutCubic(t);
        x = lerp(slot.originX, slot.baseX, eased);
        y = lerp(slot.originY, slot.baseY, eased);
        opacity = 1;
        if (t >= 1) slot.stage = "active";
      } else if (slot.stage === "exiting") {
        const t = stageElapsed / (PINK_DROP_CONFIG.exitDuration / 1000);
        if (t >= 1) {
          slot.active = false;
          slot.stage = "idle";
          slot.el.style.opacity = "0";
          delete slot.el.dataset.commentId;
          delete slot.el.dataset.commentText;
          delete slot.el.dataset.commentCreatedAt;
          delete slot.el.dataset.commentUpdatedAt;
          slot.commentId = null;
          continue;
        }
        slot.radiusPx = slot.exitStartRadiusPx * exitScaleMultiplier(t);
        const floatX = Math.sin(elapsed * slot.speed + slot.phase) * slot.amplitude;
        const floatY = Math.cos(elapsed * slot.speed * 0.7 + slot.phase) * slot.amplitude;
        x = slot.baseX + floatX;
        y = slot.baseY + floatY;
        opacity = 1 - easeOutCubic(t);
      } else if (slot.stage === "popping-out") {
        const t = stageElapsed / (PINK_DROP_CONFIG.popOutDuration / 1000);
        if (t >= 1) {
          slot.active = false;
          slot.stage = "idle";
          slot.el.style.opacity = "0";
          delete slot.el.dataset.commentId;
          delete slot.el.dataset.commentText;
          delete slot.el.dataset.commentCreatedAt;
          delete slot.el.dataset.commentUpdatedAt;
          slot.commentId = null;
          continue;
        }
        slot.radiusPx = slot.exitStartRadiusPx * popOutScaleMultiplier(t);
        x = slot.baseX;
        y = slot.baseY;
        opacity = t < 0.3 ? 1 : 1 - easeOutCubic((t - 0.3) / 0.7);
      } else {
        // active — radiusPx was fixed at spawn (random, see placeAndActivate/hydrate) and doesn't change with age
        const floatX = Math.sin(elapsed * slot.speed + slot.phase) * slot.amplitude;
        const floatY = Math.cos(elapsed * slot.speed * 0.7 + slot.phase) * slot.amplitude;
        x = slot.baseX + floatX;
        y = slot.baseY + floatY;
      }

      const scale = slot.radiusPx / MAX_RADIUS;
      slot.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      slot.el.style.opacity = String(opacity);
    }
  }

  function clearAll(elapsed: number) {
    for (const slot of pool.slots) {
      if (slot.active && slot.stage !== "exiting" && slot.stage !== "popping-out" && slot.stage !== "idle") {
        slot.exitStartRadiusPx = slot.radiusPx;
        slot.stage = "exiting";
        slot.stageStartTime = elapsed;
      }
    }
  }

  /** User-deleted a bubble by clicking it and confirming — a quick punchy pop, not the slow graceful fade clearAll uses. */
  function removeByCommentId(commentId: string) {
    const slot = pool.slots.find((s) => s.commentId === commentId && s.active);
    if (!slot || slot.stage === "exiting" || slot.stage === "popping-out") return;
    slot.exitStartRadiusPx = slot.radiusPx;
    slot.stage = "popping-out";
    slot.stageStartTime = lastElapsed;
  }

  /** User-edited a bubble's message — swaps the displayed text in place, no respawn/resize. */
  function updateTextByCommentId(commentId: string, text: string, updatedAt: string) {
    const slot = pool.slots.find((s) => s.commentId === commentId && s.active);
    if (!slot) return;
    slot.textInnerEl.textContent = text;
    slot.el.dataset.commentText = text;
    slot.el.dataset.commentUpdatedAt = updatedAt;
  }

  return { spawn, update, clearAll, hydrate, removeByCommentId, updateTextByCommentId };
}
