import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient } from "../config/redis.js";
import { saveMessage } from "../controllers/chatController.js";

let io;

export const initializeSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Setup Redis Adapter
  try {
    const subClient = redisClient.duplicate();
    subClient.on("error", (err) => console.log("Redis Sub Client Error", err));

    await subClient.connect();
    io.adapter(createAdapter(redisClient, subClient));
    console.log("Socket.io Redis Adapter Connected");
  } catch (error) {
    console.error(
      "Redis Adapter failed to connect, falling back to local memory:",
      error.message,
    );
  }

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join-room", (meetingCode, userId, userName) => {
      if (!meetingCode || !userId) return;

      socket.join(meetingCode);
      socket.to(meetingCode).emit("user-connected", { userId, userName });
      io.to(meetingCode).emit("notification", `${userName} joined the meeting`);

      socket.on("disconnect", () => {
        socket.to(meetingCode).emit("user-disconnected", userId);
        io.to(meetingCode).emit("notification", `${userName} left the meeting`);
      });
    });

    socket.on(
      "send-message",
      async ({ meetingCode, message, senderId, senderName, senderAvatar }) => {
        const saved = await saveMessage(meetingCode, senderId, message);
        if (saved) {
          io.to(meetingCode).emit("new-message", {
            content: message,
            sender: { _id: senderId, name: senderName, avatar: senderAvatar },
            timestamp: new Date(),
          });
        }
      },
    );

    socket.on("offer", (payload) =>
      io.to(payload.target).emit("offer", payload),
    );
    socket.on("answer", (payload) =>
      io.to(payload.target).emit("answer", payload),
    );
    socket.on("ice-candidate", (incoming) =>
      io.to(incoming.target).emit("ice-candidate", incoming),
    );
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
