import express from "express";
import { verifyOtp, resendOtp } from "../controllers/otpController.js";
import {
  verifyOtpLimiter,
  resendOtpLimiter,
} from "../middleware/otpRateLimitMiddleware.js";

const router = express.Router();

router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.post("/resend-otp", resendOtpLimiter, resendOtp);

export default router;
