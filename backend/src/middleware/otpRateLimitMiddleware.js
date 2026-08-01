import rateLimit from "express-rate-limit";

export const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Too many verification attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    message:
      "Too many resend requests. Please wait 15 minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
