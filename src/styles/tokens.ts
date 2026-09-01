/**
 * Design token source of truth. `tokens.css` mirrors these as CSS custom
 * properties for component styling; this file is for TS/canvas/three.js
 * consumers (bubble textures, glow sprites, gradients) that need raw values.
 *
 * Rebranded to a yellow / white / black theme (Kyochon Chicken). The
 * `pink*` key names are kept as-is rather than renamed across ~20 files
 * that reference them — only the values changed. Read them by role:
 * mist/pale/soft/core/strong = light-to-saturated yellow/gold scale,
 * ink/deep = near-black text tones.
 */
export const colors = {
  pinkMist: "#FFFDF2",
  pinkPale: "#FFF6D9",
  pinkWhite: "#FFFFFF",

  pinkSoft: "#FFDD66",
  pinkCore: "#FFC300",
  pinkStrong: "#E8A200",

  pinkDeep: "#4A3F1F",
  pinkInk: "#171310",

  white: "#FFFFFF",
} as const;

export const typography = {
  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
  wordmark: {
    letterSpacing: "0.02em",
    fontWeight: 600,
  },
  title: {
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  body: {
    fontWeight: 400,
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "40px",
  xxl: "64px",
} as const;

export const radius = {
  sm: "8px",
  md: "16px",
  lg: "24px",
  pill: "999px",
} as const;

export const shadow = {
  soft: "0 8px 32px rgba(23, 19, 16, 0.14)",
  card: "0 4px 20px rgba(23, 19, 16, 0.10)",
} as const;

export const glow = {
  bubble: "rgba(255, 255, 255, 0.55)",
  ambient: "rgba(255, 195, 0, 0.22)",
} as const;

export const animation = {
  easeOutSoft: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOutSoft: "cubic-bezier(0.45, 0, 0.55, 1)",
  fast: "180ms",
  base: "320ms",
  slow: "600ms",
} as const;

export const tokens = { colors, typography, spacing, radius, shadow, glow, animation };
