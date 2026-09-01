"use client";

import { useEffect, type RefObject } from "react";
import { updateSpawnOrigin } from "@/lib/spawnOrigin";

/** Tracks a point new bubbles pop in from — the given element's horizontal center, at its top or bottom edge (or true center). */
export function useSpawnOriginObserver(
  ref: RefObject<HTMLElement | null>,
  anchor: "center" | "top" | "bottom" = "center"
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (anchor === "bottom") {
        updateSpawnOrigin({ x: rect.x, y: rect.y + rect.height, width: rect.width, height: 0 });
      } else if (anchor === "top") {
        updateSpawnOrigin({ x: rect.x, y: rect.y, width: rect.width, height: 0 });
      } else {
        updateSpawnOrigin(rect);
      }
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, anchor]);
}
