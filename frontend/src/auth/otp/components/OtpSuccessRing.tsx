import { AnimatePresence, motion } from "framer-motion";
import { C, RING_R, RING_SVG, RING_PULSE } from "../constants";

interface SuccessRingProps {
  active: boolean;
}

export function OtpSuccessRing({ active }: SuccessRingProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="success-ring"
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{
            width: RING_SVG,
            height: RING_SVG,
            marginLeft: -RING_SVG / 2,
            marginTop: -RING_SVG / 2,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.svg
            width={RING_SVG}
            height={RING_SVG}
            viewBox={`0 0 ${RING_SVG} ${RING_SVG}`}
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx={RING_SVG / 2}
              cy={RING_SVG / 2}
              r={RING_R}
              fill="none"
              stroke="rgba(34,197,94,0.55)"
              strokeWidth="1.5"
              strokeDasharray="5 9"
              strokeLinecap="round"
            />
          </motion.svg>

          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = RING_SVG / 2 + Math.cos(rad) * RING_R;
            const cy = RING_SVG / 2 + Math.sin(rad) * RING_R;
            return (
              <motion.span
                key={deg}
                className="absolute rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  left: cx - 2.5,
                  top: cy - 2.5,
                  background: C.success,
                  boxShadow: `0 0 7px ${C.success}`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: RING_PULSE,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (deg / 360) * 0.6,
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
