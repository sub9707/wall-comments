import { colors } from "@/styles/tokens";
import { PINK_DROP_CONFIG } from "@/lib/config";

export type BubbleStage = "idle" | "popping" | "traveling" | "active" | "exiting" | "popping-out";

export type BubbleDomSlot = {
  el: HTMLDivElement;
  textEl: HTMLDivElement;
  active: boolean;
  commentId: string | null;
  stage: BubbleStage;
  stageStartTime: number;
  spawnOrder: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
  radiusPx: number;
  targetRadiusPx: number;
  exitStartRadiusPx: number;
  phase: number;
  speed: number;
  amplitude: number;
};

export type BubbleDomPoolInstance = {
  container: HTMLDivElement;
  slots: BubbleDomSlot[];
  dispose: () => void;
};

// Fixed at the max possible diameter — every bubble's actual size is
// expressed purely as a `transform: scale()` of this constant box, so
// resizing a bubble (spawn pop, recency-based growth/shrink, exit)
// never touches layout-affecting properties (width/height/top/left),
// only compositor-cheap transform/opacity.
const MAX_DIAMETER = PINK_DROP_CONFIG.bubbleSize.max * 2;

/**
 * Pre-allocates the fixed pool of bubble DOM elements up front — this
 * IS the object pool, created once and reused for the whole session.
 * No Three.js/WebGL involved: `glass-bubble.png` is shown via a plain
 * <img>, exactly as authored (no filters/tint), with the comment text
 * as a centered sibling — both children of one positioned container so
 * they move together for free, no separate position-sync needed.
 */
export function createBubbleDomPool(count: number): BubbleDomPoolInstance {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: "5",
  });
  document.body.appendChild(container);

  const slots: BubbleDomSlot[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${MAX_DIAMETER}px`,
      height: `${MAX_DIAMETER}px`,
      opacity: "0",
      willChange: "transform, opacity",
      contain: "layout style paint",
      // Auto even when idle/invisible — a scale(0) box hit-tests as
      // zero-size, so this only ever intercepts clicks on a visible bubble.
      pointerEvents: "auto",
      cursor: "pointer",
    });

    const img = document.createElement("img");
    img.src = "/assets/glass-bubble.png";
    img.alt = "";
    img.draggable = false;
    Object.assign(img.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    el.appendChild(img);

    const textEl = document.createElement("div");
    Object.assign(textEl.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "56%",
      height: "56%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      whiteSpace: "pre-line",
      wordBreak: "break-all",
      overflowWrap: "anywhere",
      overflow: "hidden",
      fontFamily: "'Gangwon Hyunoksam', var(--font-family)",
      fontWeight: "500",
      fontSize: "44px", // reference size at MAX_DIAMETER — shrinks with the bubble via transform: scale()
      color: colors.pinkInk,
      lineHeight: "1.25",
    });
    el.appendChild(textEl);

    container.appendChild(el);

    slots.push({
      el,
      textEl,
      active: false,
      commentId: null,
      stage: "idle",
      stageStartTime: 0,
      spawnOrder: 0,
      originX: 0,
      originY: 0,
      baseX: 0,
      baseY: 0,
      radiusPx: 0,
      targetRadiusPx: 0,
      exitStartRadiusPx: 0,
      phase: Math.random() * Math.PI * 2,
      speed: 0,
      amplitude: 0,
    });
  }

  return {
    container,
    slots,
    dispose: () => {
      container.remove();
    },
  };
}

export { MAX_DIAMETER };
