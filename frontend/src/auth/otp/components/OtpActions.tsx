import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { C, SNAPPY } from "../constants";

interface OtpActionsProps {
  showActions: boolean;
  isComplete: boolean;
  isDisabled: boolean;
  cooldownSeconds: number;
  isResending: boolean;
  onVerify: () => void;
  onResend: () => void;
}

export function OtpActions({
  showActions,
  isComplete,
  isDisabled,
  cooldownSeconds,
  isResending,
  onVerify,
  onResend,
}: OtpActionsProps) {
  return (
    <AnimatePresence>
      {showActions && (
        <motion.div
          key="actions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 space-y-3"
        >
          <motion.button
            type="button"
            disabled={!isComplete || isDisabled}
            onClick={onVerify}
            whileTap={isComplete ? { scale: 0.97 } : undefined}
            whileHover={isComplete ? { scale: 1.01 } : undefined}
            animate={{ opacity: isComplete ? 1 : 0.4 }}
            transition={SNAPPY}
            className="relative h-11 w-full overflow-hidden rounded-2xl text-sm font-semibold text-white disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #2563eb 100%)`,
              boxShadow: isComplete
                ? "0 10px 24px rgba(59,130,246,0.35), 0 3px 8px rgba(59,130,246,0.2)"
                : "none",
              transition: "box-shadow 0.3s ease",
            }}
          >
            Verify Code
          </motion.button>

          <div
            className="flex items-center justify-between text-xs"
            style={{ color: C.text3 }}
          >
            <span>Didn&apos;t receive the code?</span>
            <button
              onClick={onResend}
              disabled={cooldownSeconds > 0 || isResending}
              className="flex items-center gap-1 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: cooldownSeconds > 0 ? C.text3 : C.primary2 }}
            >
              <RefreshCw
                className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`}
              />
              {cooldownSeconds > 0
                ? `Resend in ${cooldownSeconds}s`
                : isResending
                  ? "Sending..."
                  : "Resend Code"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
