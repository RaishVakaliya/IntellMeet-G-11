import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { useOtpStore } from "@/stores/otpStore";
import { useVerifyOtpMutation } from "@/hooks/useOtpMutations";
import { S, ORBIT_MS, COLLAPSE_MS } from "./constants";
import type { Status } from "./constants";

interface UseOtpFlowOptions {
  activeEmail: string;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  resetDigits: () => void;
}

export function useOtpFlow({
  activeEmail,
  inputRefs,
  resetDigits,
}: UseOtpFlowOptions) {
  const verifyMutation = useVerifyOtpMutation();
  const { cooldownSeconds, decrementCooldown } = useOtpStore();

  const [status, setStatus] = useState<Status>(S.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const t = setInterval(() => decrementCooldown(), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimers(), []);

  const isDisabled =
    status === S.VERIFYING || status === S.COLLAPSING || status === S.SUCCESS;
  const isError = status === S.ERROR;
  const isSuccess = status === S.SUCCESS;
  const showActions = status === S.IDLE || status === S.ERROR;

  const handleComplete = useCallback(
    (code: string) => {
      if (!activeEmail || verifyMutation.isPending) return;
      setErrorMsg("");
      setStatus(S.VERIFYING);

      const t1 = setTimeout(() => {
        setStatus(S.COLLAPSING);
        verifyMutation.mutate(
          { email: activeEmail, otp: code },
          {
            onSuccess: () => {
              const t2 = setTimeout(() => setStatus(S.SUCCESS), COLLAPSE_MS);
              timers.current.push(t2);
            },
            onError: (err) => {
              clearTimers();
              setStatus(S.ERROR);
              setErrorMsg(err.message || "Incorrect code. Please try again.");
              setShakeKey((k) => k + 1);
              resetDigits();
              setTimeout(() => {
                inputRefs.current[0]?.focus();
                setFocusedIndex(0);
              }, 50);
            },
          },
        );
      }, ORBIT_MS);

      timers.current.push(t1);
    },
    [activeEmail, verifyMutation, resetDigits, inputRefs],
  );

  const clearError = useCallback(() => {
    if (status === S.ERROR) {
      setStatus(S.IDLE);
      setErrorMsg("");
    }
  }, [status]);

  return {
    status,
    errorMsg,
    shakeKey,
    focusedIndex,
    setFocusedIndex,
    isDisabled,
    isError,
    isSuccess,
    showActions,
    cooldownSeconds,
    handleComplete,
    clearError,
  };
}
