/**
 * Single source of truth for tunable numbers across the app.
 * Keep every "magic number" here so the wall can be re-tuned on-site
 * without hunting through component code.
 */
export const PINK_DROP_CONFIG = {
  // Bubble pool / DB
  maxActiveBubbles: 45,
  maxCommentLength: 50,
  todayFetchLimit: 40,

  // Spawn choreography: a new comment pops (scale 0 -> full) fixed at
  // the logo, THEN travels to its resting spot — "실제 방울처럼" a drop
  // forming at the source before drifting into the wall.
  spawnAnimation: {
    popDuration: 750, // ms — 0 -> full size, held at the origin
    travelDuration: 900, // ms — origin -> resting position, eased in+out
  },
  exitDuration: 1200, // ms — slow graceful fade, used by admin CLEAR SCREEN / date rollover
  popOutDuration: 380, // ms — quick punchy pop, used when a visitor deletes their own click target

  // Bubble size is random per bubble (not tied to age or text length) —
  // fixed at spawn and unchanged for the bubble's whole lifetime on the
  // wall. Sized so ~45 bubbles at full pool capacity fit the
  // safe-zone-excluded area at roughly half coverage — enough to still
  // touch/cluster (the "밀리는 느낌" the spec wants) without text
  // becoming unreadable.
  bubbleSize: {
    min: 90,
    max: 170,
  },

  // Floating motion
  floatAmplitude: 8,
  floatSpeed: 0.15,

  // Separation
  separationStrength: 0.6,
  separationPadding: 16, // extra px kept between bubble edges

  // Ripple
  rippleDuration: 700, // ms
  rippleMaxScaleMultiplier: 2.6,
  maxConcurrentRipples: 8,

  // Droplets (background ambient particles)
  dropletCount: 40,
  dropletMinSize: 4,
  dropletMaxSize: 20,

  // Input UX
  submitCooldown: 2500, // ms

  // Server-side rate limiting
  rateLimit: {
    windowMs: 10_000,
    maxRequestsPerWindow: 3,
  },
  // Relaxed on purpose: this only needs to catch an accidental
  // double-submit (double Enter/click), not block two different
  // visitors who happen to write the same short phrase ("맛있어요!").
  duplicateWindowMs: 6_000,

  // Date rollover polling
  dateRolloverPollMs: 30_000,
  statsPollMs: 8_000,
} as const;

export type PinkDropConfig = typeof PINK_DROP_CONFIG;
