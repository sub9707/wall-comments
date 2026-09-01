/**
 * Cross-tab control channel between /admin and the main wall display,
 * using localStorage + the native `storage` event. No WebSocket/SSE —
 * this is purely same-origin browser state, in line with the "no
 * external realtime" constraint (input PC === display PC), while still
 * letting an operator control the wall from a second tab/window on the
 * same machine.
 */

const PAUSED_KEY = "biodance:wall-paused";
const CLEAR_SIGNAL_KEY = "biodance:wall-clear-signal";

export function setWallPaused(paused: boolean): void {
  try {
    localStorage.setItem(PAUSED_KEY, paused ? "1" : "0");
  } catch {
    // localStorage unavailable (private mode, etc.) — degrade silently.
  }
}

export function getWallPaused(): boolean {
  try {
    return localStorage.getItem(PAUSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function triggerClearScreen(): void {
  try {
    localStorage.setItem(CLEAR_SIGNAL_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

type ControlListener = {
  onPausedChange?: (paused: boolean) => void;
  onClearSignal?: () => void;
};

/** Subscribes to control changes from other tabs. Returns an unsubscribe fn. */
export function subscribeToAdminControl(listener: ControlListener): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === PAUSED_KEY) {
      listener.onPausedChange?.(event.newValue === "1");
    } else if (event.key === CLEAR_SIGNAL_KEY) {
      listener.onClearSignal?.();
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
