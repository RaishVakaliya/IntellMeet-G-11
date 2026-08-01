import { useEffect } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Check } from "lucide-react";
import {
  S,
  C,
  BOX,
  ORBIT_R,
  ORBIT_DUR,
  STAGE_W,
  SNAPPY,
  GENTLE,
  BOUNCE,
} from "../constants";
import { boxTarget } from "../animationUtils";
import { OtpDigitBox } from "./OtpDigitBox";
import { OtpBrackets } from "./OtpBrackets";
import { OtpSuccessRing } from "./OtpSuccessRing";
import type { StageProps } from "../types";

export function OtpAnimatedStage({
  digits,
  status,
  shakeKey,
  inputRefs,
  isError,
  focusedIndex,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  onBlur,
}: StageProps) {
  const orbitCtrl = useAnimation();
  const isInputPhase = status === S.IDLE || status === S.ERROR;
  const isVerifying = status === S.VERIFYING;
  const isCollapsing = status === S.COLLAPSING;
  const isSuccess = status === S.SUCCESS;
  const isAnimating = isVerifying || isCollapsing || isSuccess;

  useEffect(() => {
    if (isVerifying) {
      orbitCtrl.start({
        rotate: 360,
        transition: { duration: ORBIT_DUR, repeat: Infinity, ease: "linear" },
      });
    } else {
      orbitCtrl.stop();
      orbitCtrl.set({ rotate: 0 });
    }
  }, [isVerifying, orbitCtrl]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: STAGE_W, height: ORBIT_R * 2 + BOX + 20 }}
    >
      <motion.div
        key={shakeKey}
        className="absolute inset-0"
        animate={isError ? { x: [0, -9, 9, -7, 7, -3, 3, 0] } : { x: 0 }}
        transition={isError ? { duration: 0.45, ease: "easeInOut" } : undefined}
      >
        <motion.div className="absolute left-1/2 top-1/2" animate={orbitCtrl}>
          {digits.map((digit, i) => {
            const pos = boxTarget(status, i);
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ marginLeft: -BOX / 2, marginTop: -BOX / 2 }}
                animate={pos}
                transition={
                  isCollapsing || isSuccess
                    ? { ...GENTLE, duration: 0.65, delay: i * 0.05 }
                    : {
                        ...SNAPPY,
                        duration: 0.6,
                        delay: isAnimating ? i * 0.055 : 0,
                      }
                }
              >
                <motion.div
                  animate={isVerifying ? { rotate: -360 } : { rotate: 0 }}
                  transition={
                    isVerifying
                      ? {
                          duration: ORBIT_DUR,
                          repeat: Infinity,
                          ease: "linear",
                        }
                      : { duration: 0.3 }
                  }
                >
                  {isInputPhase ? (
                    <OtpDigitBox
                      index={i}
                      value={digit}
                      disabled={false}
                      isFocused={focusedIndex === i}
                      isError={isError}
                      inputRef={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      onChange={onChange}
                      onKeyDown={onKeyDown}
                      onPaste={onPaste}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  ) : (
                    <motion.div
                      className="relative flex items-center justify-center rounded-xl"
                      style={{
                        width: BOX,
                        height: BOX,
                        background:
                          isSuccess && i === 0
                            ? "rgba(34,197,94,0.10)"
                            : "rgba(59,130,246,0.07)",
                        boxShadow:
                          isSuccess && i === 0
                            ? "0 0 22px rgba(34,197,94,0.25)"
                            : "0 0 14px rgba(59,130,246,0.15)",
                      }}
                    >
                      <OtpBrackets
                        color={
                          isSuccess && i === 0
                            ? "rgba(34,197,94,0.7)"
                            : "rgba(59,130,246,0.4)"
                        }
                      />
                      <AnimatePresence mode="wait">
                        {isSuccess && i === 0 ? (
                          <motion.div
                            key="check"
                            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ ...BOUNCE, delay: 0.15 }}
                          >
                            <Check
                              size={20}
                              color={C.success}
                              strokeWidth={2}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      {(!isSuccess || i !== 0) && (
                        <motion.span
                          className="text-xl font-bold"
                          style={{ color: "rgba(96,165,250,0.7)" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {digit}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isVerifying && (
          <motion.div
            key="orbit-ring"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: ORBIT_R * 1 + BOX + 10,
              height: ORBIT_R * 1 + BOX + 10,
              border: "1.5px dashed rgba(59,130,246,0.35)",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      <OtpSuccessRing active={isSuccess} />
    </div>
  );
}
