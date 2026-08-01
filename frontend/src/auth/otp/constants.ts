export const OTP_LEN = 4;
export const BOX = 52;
export const GAP = 10;
export const ORBIT_R = 62;
export const ORBIT_DUR = 2.2;
export const ORBIT_MS = 2400;
export const COLLAPSE_MS = 900;
export const RING_PULSE = 2.0;

export const STAGE_W = Math.max(
  OTP_LEN * BOX + (OTP_LEN - 1) * GAP,
  ORBIT_R * 2 + BOX + 24,
);
export const RING_R = ORBIT_R + BOX / 2 - 4;
export const RING_SVG = RING_R * 2 + 20;

export const SNAPPY = { type: "spring", stiffness: 420, damping: 28 } as const;
export const GENTLE = { type: "spring", stiffness: 260, damping: 24 } as const;
export const BOUNCE = { type: "spring", stiffness: 320, damping: 18 } as const;

export const S = {
  IDLE: "idle",
  VERIFYING: "verifying",
  COLLAPSING: "collapsing",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type Status = (typeof S)[keyof typeof S];

export const C = {
  bg: "#050508",
  surface: "#0c0c14",
  surface2: "#12121e",
  primary: "#3b82f6",
  primary2: "#60a5fa",
  success: "#22c55e",
  error: "#ef4444",
  text: "#f0f2f8",
  text2: "#8b95aa",
  text3: "#4b5568",
} as const;
