import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import Otp from "../models/otpModel.js";
import { sendOtpEmail } from "../services/emailService.js";
import { redisClient } from "../config/redis.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} from "../utils/generateToken.js";

export const generateNumericOtp = () => String(crypto.randomInt(1000, 9999));

export const verifyOtp = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  if (!/^\d{4}$/.test(otp))
    return res.status(400).json({ message: "OTP must be a 4-digit number." });

  try {
    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(400).json({
        message: "Code expired or invalid. Please request a new one.",
      });

    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      record.attempts += 1;
      await record.save();
      const left = 5 - record.attempts;
      return res
        .status(400)
        .json({ message: `Invalid code. ${left} attempt(s) remaining.` });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User account not found." });

    user.isVerified = true;
    await user.save();

    if (redisClient.isOpen) {
      await redisClient.del(`user:${user._id}`);
    }

    await Otp.deleteOne({ _id: record._id });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: true,
      accessToken,
      message: "Account verified successfully!",
    });
  } catch (err) {
    console.error("[OtpController] verify:", err);
    return res
      .status(500)
      .json({ message: "Server error during verification." });
  }
};

export const resendOtp = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "Account already verified. Please sign in." });

    await Otp.deleteMany({ email });

    const rawOtp = generateNumericOtp();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    await Otp.create({ email, otpHash, attempts: 0 });

    await sendOtpEmail({ toEmail: user.email, toName: user.name, otp: rawOtp });

    return res.status(200).json({
      message: "A new verification code has been sent to your email.",
      email,
    });
  } catch (err) {
    console.error("[OtpController] resend:", err);
    return res
      .status(500)
      .json({ message: "Failed to resend code. Please try again." });
  }
};
