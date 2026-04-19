import { users } from '../utils/mockData.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'intellmeet-fallback-secret-2024';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization header required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT decoded payload:', decoded);
    
    const user = Array.from(users.values()).find(u => u._id === decoded.userId);
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: "Invalid token - user not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verify error:', error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
