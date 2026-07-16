import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient } from "../config/redis.js";
import { registerChatEvents } from "./chatEvents.js";
import { registerMeetingEvents } from "./meetingEvents.js";
import jwt from "jsonwebtoken";

let io;

const roomScreenSharer = new Map();

export const initializeSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

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

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.verifiedUserId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    const verifiedUserId = socket.data.verifiedUserId;
    if (verifiedUserId) {
      socket.join(`user:${verifiedUserId}`);
      console.log(
        `[Socket] User ${verifiedUserId} joined room user:${verifiedUserId}`,
      );
    }

    registerMeetingEvents(io, socket, roomScreenSharer);
    registerChatEvents(io, socket);

    socket.on("join-lobby", (userId) => {
      if (!userId) return;
      console.log(`[Socket] User ${userId} joined their personal lobby room`);
      socket.join(`user:${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
