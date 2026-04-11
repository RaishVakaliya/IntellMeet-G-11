const users = new Map(); // shared with controller

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const allUsers = Array.from(users.values());
    const user = allUsers.find(u => u._id === decoded.userId);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
