import { AnimatePresence, motion } from "framer-motion";
import { BOX, SNAPPY } from "../constants";
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
  const border = isError
    ? "2px solid #ef4444"
    : isFocused
      ? "2px solid #22c55e"
      : value
        ? "1.5px solid rgba(255, 255, 255, 0.25)"
        : "1.5px solid rgba(255, 255, 255, 0.12)";

  const bg = isError
    ? "rgba(239, 68, 68, 0.05)"
    : isFocused
      ? "rgba(34, 197, 94, 0.04)"
      : "rgba(255, 255, 255, 0.03)";

  return (
    <motion.div
      layout
      className="relative"
      animate={{
        scale: isFocused && !disabled ? 1.05 : 1,
        y: isFocused && !disabled ? -2 : 0,
      }}
      transition={SNAPPY}
    >
      <div
        className="relative flex items-center justify-center rounded-2xl"
        style={{
          width: BOX,
          height: BOX,
          background: bg,
          border: border,
          boxShadow: "none",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
      >
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
                style={{ background: "#ffffff" }}
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
          className="absolute inset-0 h-full w-full cursor-pointer rounded-2xl border-0 bg-transparent text-center text-2xl font-bold text-transparent outline-none"
          style={{ caretColor: "transparent" }}
        />
      </div>
    </motion.div>
  );
}
