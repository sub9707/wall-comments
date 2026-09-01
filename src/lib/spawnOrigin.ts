/**
 * Where a new bubble pops into existence (its center, in CSS px) —
 * tracked separately from the safe-zone registry because this is a
 * single reference point for spawn animation, not an exclusion zone
 * bubbles must avoid (it sits inside the "center" safe zone already).
 */
export const spawnOrigin = { x: 0, y: 0 };

export function updateSpawnOrigin(rect: { x: number; y: number; width: number; height: number }): void {
  spawnOrigin.x = rect.x + rect.width / 2;
  spawnOrigin.y = rect.y + rect.height / 2;
}
