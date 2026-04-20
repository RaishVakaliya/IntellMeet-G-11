import User from '../models/userModel.js';
import { generateAccessToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import { upload } from '../config/cloudinary.js'; // for avatar

const JWT_SECRET = process.env.JWT_SECRET || 'intellmeet-fallback-secret-2024';

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const accessToken = generateAccessToken(user._id);

    // Response (frontend expects)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // req.user from authMiddleware (_id)
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map to frontend User type
    const profile = {
      ...user.toObject(),
      username: user.name,
      avatarUrl: user.avatar,
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = {
      ...user.toObject(),
      username: user.name,
      avatarUrl: user.avatar,
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary (existing config)
    const result = await new Promise((resolve, reject) => {
      upload.upload(req.file.path, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Update user avatarUrl
    await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(decoded.userId);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Refresh failed' });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

export const googleCallback = (req, res) => {
  // Mock Google callback - redirect to frontend dashboard
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
};

