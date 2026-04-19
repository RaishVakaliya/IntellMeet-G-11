import express from "express";
import passport from "../config/passport.js";
import { googleCallback, signup, login, refreshToken, logout, getUserProfile, uploadAvatar } from "../controllers/mockUserController.js";
import { protect } from "../middleware/authMiddleware.js";
// Mocks for unused routes
const authLimiter = (req, res, next) => next();
const upload = { single: () => (req, res, next) => next() };

const router = express.Router();

//Redirect to google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

//callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/signin`,
  }),
  googleCallback,
);

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

//protected routes
router.get("/profile", protect, getUserProfile);
router.post("/avatar-upload", protect, upload.single("avatar"), uploadAvatar);

export default router;
