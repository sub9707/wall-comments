import type { BubbleManager } from "@/components/pink-drop/BubbleManager";

/**
 * Module-level handle to the live BubbleManager instance, set by
 * BubbleField on mount. Lets the delete-confirm modal (a plain React
 * component outside the imperative bubble system) trigger the pop-out
 * animation without threading the manager through props/context.
 */
export const bubbleManagerRef: { current: BubbleManager | null } = { current: null };
