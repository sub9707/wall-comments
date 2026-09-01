"use client";

import { useState } from "react";
import { PINK_DROP_CONFIG } from "@/lib/config";
import { colors } from "@/styles/tokens";
import styles from "./Droplets.module.css";

// Flat pastel fills (no gradient shading per-particle) — a small palette
// so particles read as a soft, varied pastel scatter rather than one
// uniform color.
const PASTEL_PALETTE = [colors.pinkMist, colors.pinkPale, colors.pinkSoft, colors.white];

type Droplet = {
  id: number;
  leftPct: number;
  topPct: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
};

/**
 * Ambient background droplets — purely decorative idle-state motion.
 * Pure CSS `@keyframes` (randomized per-instance via custom properties
 * set once), so there's zero JS work per frame: the compositor drives
 * all of it independent of the bubble animation loop.
 */
export function Droplets() {
  // Lazy useState initializer: this one-time random layout must run
  // exactly once, which useState guarantees (unlike useMemo, which is
  // only a cache React may discard/recompute at times that would
  // visibly reshuffle the droplets).
  const [droplets] = useState<Droplet[]>(() => {
    const list: Droplet[] = [];
    for (let i = 0; i < PINK_DROP_CONFIG.dropletCount; i++) {
      list.push({
        id: i,
        leftPct: Math.random() * 100,
        topPct: Math.random() * 100,
        size:
          PINK_DROP_CONFIG.dropletMinSize +
          Math.random() * (PINK_DROP_CONFIG.dropletMaxSize - PINK_DROP_CONFIG.dropletMinSize),
        color: PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)]!,
        dx: (Math.random() - 0.5) * 28,
        dy: (Math.random() - 0.5) * 28,
        duration: 6 + Math.random() * 6,
        delay: -Math.random() * 10,
      });
    }
    return list;
  });

  return (
    <div className={styles.field}>
      {droplets.map((d) => (
        <span
          key={d.id}
          className={styles.droplet}
          style={{
            left: `${d.leftPct}%`,
            top: `${d.topPct}%`,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            // @ts-expect-error custom properties aren't in CSSProperties
            "--dx": `${d.dx}px`,
            "--dy": `${d.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
