import { v2 as cloudinary } from "cloudinary";
import { createRequire } from "module";   // ✅ built-in Node module
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Bypass ESM↔CJS interop entirely — use native require()
const require = createRequire(import.meta.url);
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // ✅ works correctly

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "intellmeet-avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: `avatar_${req.user?.id || Date.now()}`, // unique per user
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
});