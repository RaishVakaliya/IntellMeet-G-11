import { AnimatePresence, motion } from "framer-motion";
import { BOX, SNAPPY } from "../constants";
import { OtpBrackets } from "./OtpBrackets";
import type { OtpDigitBoxProps } from "../types";

export function OtpDigitBox({
  index,
  value,
  disabled,
  isFocused,
  isError,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  onBlur,
}: OtpDigitBoxProps) {
  const bracketColor = isError
    ? "rgba(239,68,68,0.75)"
    : isFocused
      ? "rgba(59,130,246,0.85)"
      : value
        ? "rgba(59,130,246,0.4)"
        : "rgba(255,255,255,0.07)";

  const bg = isError
    ? "rgba(239,68,68,0.07)"
    : isFocused
      ? "rgba(59,130,246,0.07)"
      : value
        ? "rgba(59,130,246,0.04)"
        : "rgba(255,255,255,0.03)";

  const glow = isFocused
    ? "0 0 18px rgba(59,130,246,0.2)"
    : isError
      ? "0 0 14px rgba(239,68,68,0.14)"
      : "none";

  return (
    <motion.div
      layout
      className="relative"
      animate={{
        scale: isFocused && !disabled ? 1.06 : 1,
        y: isFocused && !disabled ? -2 : 0,
      }}
      transition={SNAPPY}
    >
      <div
        className="relative flex items-center justify-center rounded-xl"
        style={{
          width: BOX,
          height: BOX,
          background: bg,
          boxShadow: glow,
          transition: "background 0.2s, box-shadow 0.25s",
        }}
      >
        <OtpBrackets color={bracketColor} />

        <AnimatePresence mode="popLayout">
          {value ? (
            <motion.span
              key={`v-${value}-${index}`}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold text-white"
              style={{ fontVariantNumeric: "tabular-nums" }}
              initial={{ opacity: 0, scale: 0.5, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: -6 }}
              transition={{ type: "spring", stiffness: 480, damping: 24 }}
            >
              {value}
            </motion.span>
          ) : isFocused && !disabled ? (
            <motion.span
              key="caret"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span
                className="h-5 w-[2px] rounded-full"
                style={{ background: "rgba(59,130,246,0.9)" }}
              />
            </motion.span>
          ) : null}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          maxLength={1}
          value={value}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1} of 4`}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
          onFocus={() => onFocus(index)}
          onBlur={onBlur}
          className="absolute inset-0 h-full w-full cursor-pointer rounded-xl border-0 bg-transparent text-center text-2xl font-bold text-transparent outline-none"
          style={{ caretColor: "transparent" }}
        />
      </div>
    </motion.div>
  );
}
