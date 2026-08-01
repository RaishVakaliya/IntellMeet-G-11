import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { OTP_LEN } from "./constants";

interface UseOtpInputOptions {
  isDisabled: boolean;
  onComplete: (code: string) => void;
}

export function useOtpInput({ isDisabled, onComplete }: UseOtpInputOptions) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback(
    (i: number) => inputRefs.current[i]?.focus(),
    [],
  );

  const resetDigits = useCallback(() => setDigits(Array(OTP_LEN).fill("")), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback(
    (i: number, raw: string) => {
      if (isDisabled) return;
      const v = raw.replace(/\D/g, "").slice(-1);
      if (!v) return;
      setDigits((prev) => {
        const next = [...prev];
        next[i] = v;
        if (i === OTP_LEN - 1 && next.join("").length === OTP_LEN)
          queueMicrotask(() => onComplete(next.join("")));
        return next;
      });
      if (i < OTP_LEN - 1) focusInput(i + 1);
    },
    [isDisabled, focusInput, onComplete],
  );

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        if (digits[i]) {
          setDigits((p) => {
            const n = [...p];
            n[i] = "";
            return n;
          });
          return;
        }
        if (i > 0) {
          setDigits((p) => {
            const n = [...p];
            n[i - 1] = "";
            return n;
          });
          focusInput(i - 1);
        }
        return;
      }
      if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        focusInput(i - 1);
      }
      if (e.key === "ArrowRight" && i < OTP_LEN - 1) {
        e.preventDefault();
        focusInput(i + 1);
      }
    },
    [digits, isDisabled, focusInput],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      e.preventDefault();
      const s = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LEN);
      if (!s) return;
      const next = Array(OTP_LEN).fill("") as string[];
      s.split("").forEach((c, i) => {
        next[i] = c;
      });
      setDigits(next);
      focusInput(Math.min(s.length, OTP_LEN - 1));
      if (s.length === OTP_LEN) onComplete(s);
    },
    [isDisabled, focusInput, onComplete],
  );

  return {
    digits,
    setDigits,
    inputRefs,
    focusInput,
    resetDigits,
    isComplete: digits.join("").length === OTP_LEN,
    handleChange,
    handleKeyDown,
    handlePaste,
  };
}
