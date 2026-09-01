"use client";

import { useEffect, type RefObject } from "react";
import { updateSafeZoneRect, removeSafeZoneRect, type Rect } from "@/lib/safeZoneRect";

function union(a: Rect, b: Rect): Rect {
  const left = Math.min(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Registers one safe-zone rect under `id`, measured as the union of
 * every given element's bounding rect. Elements that are logically one
 * "keep clear" region (e.g. the center title/input block and the
 * footer guide below it) must be registered together, not as separate
 * zones — pushing a bubble out of one adjacent zone can otherwise land
 * it inside the next, with no escape (see BubblePhysics.ts).
 */
export function useSafeZoneObserver(id: string, refs: RefObject<HTMLElement | null>[]): void {
  useEffect(() => {
    const elements = refs.map((r) => r.current).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const measure = () => {
      const rect = elements
        .map((el) => el.getBoundingClientRect())
        .reduce<Rect | null>((acc, r) => (acc ? union(acc, r) : { x: r.x, y: r.y, width: r.width, height: r.height }), null);
      if (rect) updateSafeZoneRect(id, rect);
    };
    measure();

    const observer = new ResizeObserver(measure);
    elements.forEach((el) => observer.observe(el));
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      removeSafeZoneRect(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...refs]);
}
