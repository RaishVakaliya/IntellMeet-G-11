import { meetingRoomsActive } from "../monitoring/metrics.js";

export const registerMeetingEvents = (io, socket, roomScreenSharer) => {
  socket.on(
    "join-room",
    async ({ meetingCode, userId, userName, dbUserId }) => {
      if (!meetingCode || !dbUserId) {
        console.warn(`[Socket] join-room failed: missing payload`, {
          meetingCode,
          dbUserId,
        });
        return;
      }

      if (
        socket.data.currentRoom === meetingCode &&
        socket.data.dbUserId === dbUserId
      ) {
        console.log(
          `[Socket] ${userName} (${dbUserId}) already in room ${meetingCode}, skipping re-join`,
        );
        return;
      }

      console.log(
        `[Socket] User ${userName} (socket=${socket.id}, db=${dbUserId}) joining room: ${meetingCode}`,
      );

      socket.data.socketId = socket.id;
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.dbUserId = dbUserId;
      socket.data.isMuted = true;
      socket.data.isCameraOff = true;
      socket.data.isScreenSharing = false;

      let existingUsers = [];
      try {
        const existingSockets = await io.in(meetingCode).fetchSockets();

        const isAlreadyJoined = existingSockets.some(
          (s) => s.data.dbUserId === dbUserId && s.id !== socket.id,
        );

        if (isAlreadyJoined) {
          console.warn(
            `[Socket] Denying join: ${userName} (${dbUserId}) already in room ${meetingCode}`,
          );
          socket.emit(
            "error-message",
            "You are already in this meeting from another tab or device.",
          );
          return;
        }

        existingUsers = existingSockets
          .filter((s) => s.data.dbUserId && s.data.dbUserId !== dbUserId)
          .map((s) => ({
            socketId: s.id,
            dbUserId: s.data.dbUserId,
            userName: s.data.userName,
            isMuted: s.data.isMuted ?? true,
            isCameraOff: s.data.isCameraOff ?? true,
            isScreenSharing: s.data.isScreenSharing ?? false,
          }));
      } catch (err) {
        console.error("[Socket] fetchSockets failed:", err.message);
      }

      socket.join(meetingCode);
      socket.data.currentRoom = meetingCode;

      const roomSockets = await io.in(meetingCode).fetchSockets();
      if (roomSockets.length === 1) {
        meetingRoomsActive.inc();
      }

      socket.emit("existing-users", existingUsers);
      console.log(
        `[Socket] Sent existing-users (${existingUsers.length}) to ${userName}`,
      );

      socket.to(meetingCode).emit("user-connected", {
        socketId: socket.id,
        dbUserId,
        userName,
        isMuted: socket.data.isMuted,
        isCameraOff: socket.data.isCameraOff,
        isScreenSharing: socket.data.isScreenSharing,
      });

      socket
        .to(meetingCode)
        .emit("notification", `${userName} joined the meeting`);
    },
  );

  const handleLeave = async (currentRoom, dbUserId, userName) => {
    if (currentRoom && dbUserId) {
      socket.leave(currentRoom);
      socket.data.currentRoom = null;
      socket.to(currentRoom).emit("user-disconnected", { dbUserId });

      if (roomScreenSharer.get(currentRoom) === dbUserId) {
        roomScreenSharer.delete(currentRoom);
        socket.to(currentRoom).emit("participant-screen-share-toggled", {
          dbUserId,
          isScreenSharing: false,
        });
      }

      io.to(currentRoom).emit(
        "notification",
        `${userName ?? "A user"} left the meeting`,
      );

      try {
        const remaining = await io.in(currentRoom).fetchSockets();
        if (remaining.length === 0) {
          meetingRoomsActive.dec();
        }
      } catch {}
    }
  };

  socket.on("leave-room", ({ meetingCode }) => {
    const { currentRoom, dbUserId, userName } = socket.data ?? {};
    if (currentRoom === meetingCode) {
      console.log(
        `[Socket] User left room: ${socket.id} (db=${dbUserId}) from room: ${currentRoom}`,
      );
      handleLeave(currentRoom, dbUserId, userName);
    }
  });

  socket.on("disconnect", () => {
    const { currentRoom, dbUserId, userName } = socket.data ?? {};
    console.log(
      `[Socket] User disconnected: ${socket.id} (db=${dbUserId})${currentRoom ? ` from room: ${currentRoom}` : ""}`,
    );
    handleLeave(currentRoom, dbUserId, userName);
  });

  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", {
      ...payload,
      callerDbUserId: socket.data.dbUserId,
      callerSocketId: socket.id,
    });
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", {
      ...payload,
      callerDbUserId: socket.data.dbUserId,
      callerSocketId: socket.id,
    });
  });

  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", {
      ...incoming,
      fromDbUserId: socket.data.dbUserId,
      fromSocketId: socket.id,
    });
  });

  socket.on("toggle-audio", ({ meetingCode, isMuted }) => {
    socket.data.isMuted = isMuted;
    socket.to(meetingCode).emit("participant-audio-toggled", {
      dbUserId: socket.data.dbUserId,
      isMuted,
    });
  });

  socket.on("toggle-video", ({ meetingCode, isCameraOff }) => {
    socket.data.isCameraOff = isCameraOff;
    socket.to(meetingCode).emit("participant-video-toggled", {
      dbUserId: socket.data.dbUserId,
      isCameraOff,
    });
  });

  socket.on("toggle-screen-share", ({ meetingCode, isScreenSharing }) => {
    const dbUserId = socket.data.dbUserId;
    if (!meetingCode || !dbUserId) return;

    if (isScreenSharing) {
      const currentSharer = roomScreenSharer.get(meetingCode);
      if (currentSharer && currentSharer !== dbUserId) {
        socket.emit("screen-share-rejected", {
          reason: "Another participant is already sharing their screen.",
        });
        return;
      }
      roomScreenSharer.set(meetingCode, dbUserId);
    } else {
      if (roomScreenSharer.get(meetingCode) === dbUserId) {
        roomScreenSharer.delete(meetingCode);
      }
    }

    socket.data.isScreenSharing = isScreenSharing;
    io.to(meetingCode).emit("participant-screen-share-toggled", {
      dbUserId,
      isScreenSharing,
    });
  });

  socket.on("sync-media-state", ({ meetingCode, isMuted, isCameraOff }) => {
    if (!meetingCode || !socket.data.dbUserId) return;

    socket.data.isMuted = isMuted;
    socket.data.isCameraOff = isCameraOff;

    socket.to(meetingCode).emit("participant-media-sync", {
      dbUserId: socket.data.dbUserId,
      isMuted,
      isCameraOff,
      isScreenSharing: socket.data.isScreenSharing ?? false,
    });
  });
};
