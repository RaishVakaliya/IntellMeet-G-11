import { generateAccessToken } from '../utils/generateToken.js';

const users = new Map(); // in-memory DB
let userIdCounter = 1;

// Pre-populate demo user for instant testing
if (users.size === 0) {
  const demoUser = {
    _id: 'mock_1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo', // matches simpleHash
  };
  users.set(demoUser.email, demoUser);
  console.log('✅ Pre-populated demo user: demo@example.com / demo');
}

const simpleHash = (pass) => pass; // demo only, no real hash

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (users.has(email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userId = `mock_${userIdCounter++}`;
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
    res.status(200).json(req.user);
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

export const uploadAvatar = (req, res) => res.status(200).json({ message: "Upload stub" });
export const googleCallback = (req, res) => res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/signin`);
