import { users } from '../utils/mockData.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization header required" });
  }

  try {
    console.log('Base64 token received:', token.substring(0, 20) + '...');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    console.log('Decoded token payload:', decoded);
    
    const user = Array.from(users.values()).find(u => u._id === decoded.userId);
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: "Invalid token - user not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token decode error:', error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
