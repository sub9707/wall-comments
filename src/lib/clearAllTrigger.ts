/**
 * Module-level handle to "clear all active bubbles right now," bound
 * to BubbleField's own elapsed-time clock. External triggers (admin
 * control bridge, date rollover, the public 전체 제거 button) all call
 * through this rather than calling `manager.clearAll(elapsed)` directly
 * with a mismatched clock value, which would desync the exit animation
 * timing on the next real update() tick.
 */
export const clearAllTrigger: { current: (() => void) | null } = { current: null };
