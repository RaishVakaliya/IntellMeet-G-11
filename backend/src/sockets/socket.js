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
      credentials: true,
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
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on(
      "join-room",
      async ({ meetingCode, userId, userName, dbUserId }) => {
        if (!meetingCode || !userId) {
          console.warn(`[Socket] join-room failed: missing payload`, {
            meetingCode,
            userId,
          });
          return;
        }

        if (socket.data.currentRoom === meetingCode) {
          console.log(
            `[Socket] ${userName} (${userId}) already in room ${meetingCode}, skipping re-join`,
          );
          return;
        }

        console.log(
          `[Socket] User ${userName} (${userId}) joining room: ${meetingCode}`,
        );

        socket.data.userId = userId;
        socket.data.userName = userName;
        socket.data.dbUserId = dbUserId;
        socket.data.isMuted = true;
        socket.data.isCameraOff = true;

        let existingUsers = [];
        try {
          const existingSockets = await io.in(meetingCode).fetchSockets();
          existingUsers = existingSockets
            .map((s) => ({
              userId: s.data.userId,
              userName: s.data.userName,
              dbUserId: s.data.dbUserId,
              isMuted: s.data.isMuted ?? true,
              isCameraOff: s.data.isCameraOff ?? true,
            }))
            .filter((u) => u.userId);
        } catch (err) {
          console.error("[Socket] fetchSockets failed:", err.message);
        }

        // Now join the room
        socket.join(meetingCode);
        socket.data.currentRoom = meetingCode;

        socket.emit("existing-users", existingUsers);
        console.log(
          `[Socket] Sent existing-users (${existingUsers.length}) to ${userName}`,
        );

        socket.to(meetingCode).emit("user-connected", {
          userId,
          userName,
          dbUserId,
          isMuted: socket.data.isMuted,
          isCameraOff: socket.data.isCameraOff,
        });

        io.to(meetingCode).emit(
          "notification",
          `${userName} joined the meeting`,
        );
      },
    );

    socket.on("disconnect", () => {
      const { currentRoom, userId, userName } = socket.data ?? {};
      console.log(
        `[Socket] User disconnected: ${socket.id}${currentRoom ? ` from room: ${currentRoom}` : ""}`,
      );
      if (currentRoom && userId) {
        socket.to(currentRoom).emit("user-disconnected", userId);
        io.to(currentRoom).emit(
          "notification",
          `${userName ?? "A user"} left the meeting`,
        );
      }
    });

    socket.on(
      "send-message",
      async ({ meetingCode, message, senderId, senderName, senderAvatar }) => {
        console.log(
          `[Socket] Message from ${senderName} in room ${meetingCode}: ${message.substring(0, 20)}...`,
        );

        try {
          const success = await saveMessage(meetingCode, senderId, message);

          if (success) {
            console.log(
              `[Socket] Message persisted for room ${meetingCode}. Emitting...`,
            );
            io.to(meetingCode).emit("new-message", {
              content: message,
              sender: { _id: senderId, name: senderName, avatar: senderAvatar },
              timestamp: new Date(),
            });
          } else {
            console.error(
              `[Socket] saveMessage returned false for room ${meetingCode}`,
            );
          }
        } catch (error) {
          console.error(
            `[Socket] Error saving/emitting message for room ${meetingCode}:`,
            error,
          );
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

    socket.on("toggle-audio", ({ meetingCode, userId, isMuted }) => {
      socket.data.isMuted = isMuted;
      socket
        .to(meetingCode)
        .emit("participant-audio-toggled", { userId, isMuted });
    });

    socket.on("toggle-video", ({ meetingCode, userId, isCameraOff }) => {
      socket.data.isCameraOff = isCameraOff;
      socket
        .to(meetingCode)
        .emit("participant-video-toggled", { userId, isCameraOff });
    });

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
