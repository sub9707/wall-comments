/**
 * Mutable registry of "safe zone" rects (center UI column, footer
 * guide, etc.) that bubbles must avoid, in CSS pixels with a top-left
 * origin matching getBoundingClientRect(). Three.js code reads this
 * directly every frame — updating it from a ResizeObserver avoids ever
 * pushing this through React state/props into the R3F tree.
 */
export type Rect = { x: number; y: number; width: number; height: number };

const zones = new Map<string, Rect>();

export function updateSafeZoneRect(id: string, rect: Rect): void {
  zones.set(id, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
}

export function removeSafeZoneRect(id: string): void {
  zones.delete(id);
}

export function getSafeZoneRects(): Rect[] {
  return Array.from(zones.values());
}

export function getSafeZoneRect(id: string): Rect | null {
  return zones.get(id) ?? null;
}
