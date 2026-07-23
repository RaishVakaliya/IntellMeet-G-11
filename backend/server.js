import "./src/config/sentry.js";
import { Sentry } from "./src/config/sentry.js";
import { register } from "./src/monitoring/metrics.js";
import { httpMetricsMiddleware } from "./src/monitoring/httpMiddleware.js";
import { startGrafanaPusher } from "./src/monitoring/grafanaPusher.js";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initializeSocket } from "./src/sockets/socket.js";
import userRoutes from "./src/routes/userRoutes.js";
import meetingRoutes from "./src/routes/meetingRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import boardRoutes from "./src/routes/boardRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import passport from "passport";
import session from "express-session";
import "./src/config/passport.js";
import { globalLimiter } from "./src/middleware/rateLimitMiddleware.js";

dotenv.config();

// Assert presence of crucial environment variables
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "REDIS_URL",
];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(
      `FATAL ERROR: Environment variable "${envVar}" is not defined.`,
    );
    process.exit(1);
  }
}

await connectDB();
await connectRedis();

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

await initializeSocket(httpServer);

app.use(helmet());
app.use(globalLimiter);
// Record HTTP request counts and latency for every route
app.use(httpMetricsMiddleware);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "IntellMeet API is running..." });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Your API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  startGrafanaPusher();
});
