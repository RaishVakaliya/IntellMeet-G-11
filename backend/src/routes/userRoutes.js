import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getUserProfile,
  uploadAvatar,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

//protected routes
router.get("/profile", protect, getUserProfile);
router.post("/avatar-upload", protect, upload.single("avatar"), uploadAvatar);

export default router;
