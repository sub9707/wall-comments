"use client";

import dynamic from "next/dynamic";
import { BubbleField } from "./BubbleField";

// Client-only: Droplets picks random positions in a useState initializer,
// which runs once during SSR and once again during hydration — since
// Math.random() isn't deterministic across those two runs, server and
// client markup would mismatch if this rendered on the server at all.
const Droplets = dynamic(() => import("./Droplets").then((m) => m.Droplets), { ssr: false });

/**
 * Pure HTML/CSS visual layer — no Three.js/WebGL. `glass-bubble.png`
 * IS the glass material (see BubbleDom.ts); this component just mounts
 * the ambient droplets (pure CSS) and the bubble pool/lifecycle owner.
 */
export function PinkDropScene() {
  return (
    <>
      <Droplets />
      <BubbleField />
    </>
  );
}
