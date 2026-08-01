import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResendOtpMutation } from "@/hooks/useOtpMutations";
import { useOtpStore } from "@/stores/otpStore";
import { useDocumentSEO } from "@/hooks/useDocumentSEO";
import {
  C,
  useOtpInput,
  useOtpFlow,
  OtpHeader,
  OtpAnimatedStage,
  OtpActions,
  OtpSuccessBanner,
} from "@/auth/otp";

export const OtpPage: React.FC = () => {
  useDocumentSEO({
    title: "Verify Your Email | IntellMeet",
    description:
      "Enter your 4-digit verification code to activate your IntellMeet account.",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");

  const pendingEmail = useOtpStore((s) => s.pendingEmail);
  const setPendingEmail = useOtpStore((s) => s.setPendingEmail);
  const resendMutation = useResendOtpMutation();

  useEffect(() => {
    if (emailParam && emailParam !== pendingEmail) setPendingEmail(emailParam);
  }, [emailParam, pendingEmail, setPendingEmail]);

  const activeEmail = emailParam || pendingEmail;

  useEffect(() => {
    if (!activeEmail) navigate("/auth/signin", { replace: true });
  }, [activeEmail, navigate]);

  const {
    digits,
    inputRefs,
    resetDigits,
    isComplete,
    handleChange,
    handleKeyDown,
    handlePaste,
  } = useOtpInput({
    isDisabled: false,
    onComplete: (code) => flow.handleComplete(code),
  });

  const flow = useOtpFlow({
    activeEmail,
    inputRefs,
    resetDigits,
  });

  const handleInputChange = (i: number, v: string) => {
    flow.clearError();
    handleChange(i, v);
  };

  const handleResend = () => {
    if (!activeEmail || flow.cooldownSeconds > 0 || resendMutation.isPending)
      return;
    resendMutation.mutate({ email: activeEmail });
  };

  const cardShadow = flow.isSuccess
    ? "0 0 0 1px rgba(34,197,94,0.15), 0 24px 60px rgba(0,0,0,0.7), 0 0 48px rgba(34,197,94,0.06)"
    : flow.isError
      ? "0 0 0 1px rgba(239,68,68,0.12), 0 24px 60px rgba(0,0,0,0.7)"
      : "0 0 0 1px rgba(59,130,246,0.08), 0 24px 60px rgba(0,0,0,0.7)";

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-4 py-8"
      style={{ background: C.bg }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-15 blur-3xl"
          style={{
            background: flow.isSuccess
              ? `radial-gradient(circle, ${C.success} 0%, transparent 70%)`
              : `radial-gradient(circle, ${C.primary} 0%, transparent 70%)`,
            transition: "background 1.2s ease",
          }}
        />
      </div>

      <motion.div
        layout
        className="relative w-full max-w-sm rounded-3xl"
        style={{
          background: `linear-gradient(145deg, ${C.surface2} 0%, ${C.surface} 100%)`,
          boxShadow: cardShadow,
          backdropFilter: "blur(24px)",
          transition: "box-shadow 0.5s ease",
          padding: "24px 20px 28px",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(59,130,246,0.15) 50%, transparent 95%)",
          }}
        />

        <OtpHeader
          activeEmail={activeEmail}
          onBack={() => navigate("/auth/signin")}
        />

        <div
          className="flex justify-center"
          role="group"
          aria-label="One-time password input"
          aria-live="polite"
          aria-busy={flow.status === "verifying"}
        >
          <OtpAnimatedStage
            digits={digits}
            status={flow.status}
            shakeKey={flow.shakeKey}
            inputRefs={inputRefs}
            isError={flow.isError}
            focusedIndex={flow.focusedIndex}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={(i) => flow.setFocusedIndex(i)}
            onBlur={() => flow.setFocusedIndex(null)}
          />
        </div>

        <AnimatePresence>
          {flow.isError && flow.errorMsg && (
            <motion.p
              key="err"
              role="alert"
              className="mt-2 text-center text-xs font-medium"
              style={{ color: C.error }}
              initial={{ opacity: 0, y: -5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {flow.errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <OtpActions
          showActions={flow.showActions}
          isComplete={isComplete}
          isDisabled={flow.isDisabled}
          cooldownSeconds={flow.cooldownSeconds}
          isResending={resendMutation.isPending}
          onVerify={() => {
            if (isComplete && !flow.isDisabled)
              flow.handleComplete(digits.join(""));
          }}
          onResend={handleResend}
        />

        <OtpSuccessBanner isSuccess={flow.isSuccess} />
      </motion.div>
    </div>
  );
};

export default OtpPage;
