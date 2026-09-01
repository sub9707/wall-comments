import { PINK_DROP_CONFIG } from "@/lib/config";
import { colors } from "@/styles/tokens";

export type RippleLayer = {
  spawn: (x: number, y: number, size: number) => void;
  dispose: () => void;
};

const KEYFRAMES_ID = "biodance-ripple-keyframes";

function ensureKeyframes(): void {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes biodance-ripple {
      from { transform: translate(-50%, -50%) scale(0); opacity: 0.55; }
      to   { transform: translate(-50%, -50%) scale(${PINK_DROP_CONFIG.rippleMaxScaleMultiplier}); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * The thin pink ring that plays where a new comment "drops in" (the
 * logo origin). A pure CSS animation per ripple — elements are created
 * on demand and removed on `animationend`, no per-frame JS driving
 * them; ripples are infrequent enough (one per submit) that pooling
 * would add complexity for no measurable benefit.
 */
export function createRippleLayer(): RippleLayer {
  ensureKeyframes();

  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: "4",
  });
  document.body.appendChild(container);

  function spawn(x: number, y: number, size: number) {
    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      border: `1.5px solid ${colors.pinkCore}`,
      boxShadow: `0 0 16px 2px ${colors.pinkSoft}`,
      transform: "translate(-50%, -50%) scale(0)",
      animation: `biodance-ripple ${PINK_DROP_CONFIG.rippleDuration}ms ease-out forwards`,
    });
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
    container.appendChild(ring);
  }

  return {
    spawn,
    dispose: () => {
      container.remove();
    },
  };
}
