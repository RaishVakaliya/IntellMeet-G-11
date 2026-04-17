import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectDB from "./src/config/db.js";
import { connectRedis, redisClient } from "./src/config/redis.js";
import RedisStore from "connect-redis";
import { initializeSocket } from "./src/sockets/socket.js";
import userRoutes from "./src/routes/userRoutes.js";
import meetingRoutes from "./src/routes/meetingRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import session from "express-session";
import { execSync } from "child_process";

// passport disabled for dev
// import passport from "passport";
// import "./src/config/passport.js";

dotenv.config();

//Connect DB & Redis - TEMP MOCK FOR TESTING
let useMockDB = true;

connectDB().catch(err => console.log('DB connect failed:', err.message));
// connectRedis().catch(err => console.log('Redis connect failed:', err.message));

console.log('Using mock DB/Redis for demo (add .env for real)');

const app = express();
const httpServer = createServer(app);

await initializeSocket(httpServer);

// Security Middleware
app.use(helmet());

// ✅ Fixed CORS for localhost + 127.0.0.1
app.use(
  cors({
    origin: process.env.FRONTEND_URL || [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

// Session disabled temporarily
/*
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
*/

// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chats", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "IntellMeet API is running..." });
});

// Server Start
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  httpServer.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use. Attempting to free it...`);
      
      try {
        // macOS command to kill process on port
        execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
        console.log(`✅ Freed port ${port}. Retrying in 2 seconds...`);
        
        setTimeout(() => startServer(port), 2000);
      } catch (killErr) {
        console.log(`⚠️  Could not auto-kill process on port ${port}. Trying next port...`);
        startServer(port + 1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);
