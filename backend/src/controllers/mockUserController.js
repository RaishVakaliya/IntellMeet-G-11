import { generateAccessToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

import { users, userIdCounter, getNextUserId } from "../utils/mockData.js";

const simpleHash = (pass) => pass; // demo only, no real hash

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (users.has(email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userId = getNextUserId();
    const user = {
      _id: userId,
      name,
      email,
      password: simpleHash(password),
    };
    users.set(email, user);

    const accessToken = generateAccessToken(userId);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = users.get(email);
    if (user && user.password === simpleHash(password)) {
      const accessToken = generateAccessToken(user._id);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        accessToken,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const profile = {
      ...req.user,
      username: req.user.name,
      avatarUrl: req.user.avatarUrl || `https://ui-avatars.com/api/?name=${req.user.name || 'User'}&background=4F46E5&color=fff&size=128&bold=true&font-size=0.6`,
    };
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intellmeet-fallback-secret-2024');
    const user = Array.from(users.values()).find(u => u._id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(decoded.userId);
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: "Refresh failed" });
  }
};

export const uploadAvatar = (req, res) => {
  console.log('✅ Mock avatar upload called', { hasFile: !!req.file, userEmail: req.user?.email });
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const mockUrl = `/mock-avatar-${req.file.originalname || 'avatar'}-${Date.now()}.jpg`;
    const email = req.user.email;
    const user = users.get(email);
    if (user) {
      user.avatar = mockUrl;
      user.avatarUrl = mockUrl;
      console.log('✅ Mock avatar set for', email, mockUrl);
    }

    res.status(200).json({ message: "Avatar uploaded (mock)", avatar: mockUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: "Upload failed" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const email = req.user.email;
    let user = users.get(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update fields - backend uses 'name', frontend sends 'username' 
    if (updates.username !== undefined) user.name = updates.username;
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined && updates.email !== email) {
      if (users.has(updates.email)) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      users.delete(email);
      user.email = updates.email;
      users.set(updates.email, user);
    }
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    const profile = {
      ...user,
      username: user.name, // Map backend 'name' to frontend 'username'
      avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=4F46E5&color=fff&size=128&bold=true&font-size=0.6`,
    };
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

export const googleCallback = (req, res) => res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/signin`);
