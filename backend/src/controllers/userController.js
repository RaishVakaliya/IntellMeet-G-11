// MOCK MODE - no DB needed
// Original imports replaced with mocks
const users = new Map();
let userIdCounter = 1;

const simpleHash = (pass) => pass; // demo only

export const googleCallback = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/signin`);
};

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

    const accessToken = Buffer.from(JSON.stringify({ userId })).toString('base64');
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
      const accessToken = Buffer.from(JSON.stringify({ userId: user._id })).toString('base64');
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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token" });
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = Array.from(users.values()).find(u => u._id === decoded.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const refreshToken = (req, res) => res.status(200).json({ accessToken: 'mock_refresh' });
export const logout = (req, res) => res.status(200).json({ message: "Logged out successfully" });
export const uploadAvatar = (req, res) => res.status(200).json({ message: "Upload stub" });


