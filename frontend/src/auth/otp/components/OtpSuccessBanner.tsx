import { motion, AnimatePresence } from "framer-motion";
import { C } from "../constants";

interface OtpSuccessBannerProps {
  isSuccess: boolean;
}

export function OtpSuccessBanner({ isSuccess }: OtpSuccessBannerProps) {
  return (
    <AnimatePresence>
      {isSuccess && (
        <motion.div
          key="success-msg"
          className="mt-5 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="text-sm font-semibold" style={{ color: C.success }}>
            ✓ Email verified successfully!
          </p>
          <p className="text-xs mt-1" style={{ color: C.text3 }}>
            Redirecting to your dashboard…
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
