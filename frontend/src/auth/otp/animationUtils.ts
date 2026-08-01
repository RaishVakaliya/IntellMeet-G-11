import { S, OTP_LEN, BOX, GAP, ORBIT_R } from "./constants";
import type { Status } from "./constants";

export function orbitPos(i: number, total: number, r: number) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

export function rowX(i: number, total: number, size: number, gap: number) {
  const w = total * size + (total - 1) * gap;
  return -w / 2 + size / 2 + i * (size + gap);
}

export function boxTarget(status: Status, i: number) {
  if (status === S.IDLE || status === S.ERROR)
    return { x: rowX(i, OTP_LEN, BOX, GAP), y: 0, scale: 1, opacity: 1 };
  if (status === S.VERIFYING) {
    const { x, y } = orbitPos(i, OTP_LEN, ORBIT_R);
    return { x, y, scale: 0.92, opacity: 1 };
  }
  return { x: 0, y: 0, scale: i === 0 ? 1.05 : 0.6, opacity: i === 0 ? 1 : 0 };
}
