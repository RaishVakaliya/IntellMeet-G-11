import { create } from "zustand";

const COOLDOWN_KEY = "otpCooldownDeadline";
const EMAIL_KEY = "pendingOtpEmail";

function getRemainingCooldown(): number {
  const raw = localStorage.getItem(COOLDOWN_KEY);
  if (!raw) return 0;
  const deadline = parseInt(raw, 10);
  if (isNaN(deadline)) return 0;
  const remaining = Math.ceil((deadline - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

interface OtpState {
  pendingEmail: string;
  cooldownSeconds: number;

  setPendingEmail: (email: string) => void;
  startCooldown: (seconds?: number) => void;
  decrementCooldown: () => void;
  reset: () => void;
}

export const useOtpStore = create<OtpState>((set) => ({
  pendingEmail: localStorage.getItem(EMAIL_KEY) || "",
  cooldownSeconds: getRemainingCooldown(),

  setPendingEmail: (email: string) => {
    localStorage.setItem(EMAIL_KEY, email);
    set({ pendingEmail: email });
  },

  startCooldown: (seconds = 60) => {
    const deadline = Date.now() + seconds * 1000;
    localStorage.setItem(COOLDOWN_KEY, String(deadline));
    set({ cooldownSeconds: seconds });
  },

  decrementCooldown: () =>
    set((state) => {
      const next = Math.max(0, state.cooldownSeconds - 1);
      if (next === 0) localStorage.removeItem(COOLDOWN_KEY);
      return { cooldownSeconds: next };
    }),

  reset: () => {
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(COOLDOWN_KEY);
    set({
      pendingEmail: "",
      cooldownSeconds: 0,
    });
  },
}));
