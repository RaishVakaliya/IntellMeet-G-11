import { generateAccessToken } from '../utils/generateToken.js';

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
      avatarUrl: `https://ui-avatars.com/api/?name=${req.user.name || 'User'}&background=4F46E5&color=fff&size=128&bold=true&font-size=0.6`,
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
    // Skip protect middleware check for refresh - always return demo token
    const demoUserId = 'mock_1';
    const accessToken = generateAccessToken(demoUserId);
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: "Refresh failed" });
  }
};

export const uploadAvatar = (req, res) => {
  try {
    const userId = req.user._id;
    const fakeCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/v1/user-avatars/${userId}.jpg`;
    res.status(200).json({ url: fakeCloudinaryUrl });
  } catch (error) {
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
