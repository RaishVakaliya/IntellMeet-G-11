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

    const accessToken = Buffer.from(JSON.stringify({ userId })).toString('base64'); // simple token
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
  try {
    // Mock req.user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token" });
    
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const allUsers = Array.from(users.values());
      const user = allUsers.find(u => u._id === decoded.userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

// Stub others
export const refreshToken = (req, res) => res.status(501).json({ message: "Not implemented" });
export const uploadAvatar = (req, res) => res.status(501).json({ message: "Not implemented" });
export const googleCallback = (req, res) => res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/signin`);
