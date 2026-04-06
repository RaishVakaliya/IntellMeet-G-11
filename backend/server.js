import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import meetingRoutes from "./src/routes/meetingRoutes.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/meetings", meetingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "IntellMeet API is running..." });
});

//Socket.io -> WebRTC Signaling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (meetingId, userId) => {
    socket.join(meetingId);
    console.log(`User ${userId} joined room ${meetingId}`);
    socket.to(meetingId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      socket.to(meetingId).emit("user-disconnected", userId);
    });
  });

  //Signaling: Relaying offer, answer, and ICE candidates
  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
