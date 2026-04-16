import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
<<<<<<< HEAD
      reconnectionAttempts: 5,
=======
      reconnectionAttempts: 10,
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const useSocket = (meetingCode?: string) => {
  const { user, accessToken } = useAuthStore();
  const socketRef = useRef<Socket>(getSocket());
<<<<<<< HEAD

=======
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket.connected) {
      socket.auth = { token: accessToken };
      socket.connect();
    }

    const emitJoinRoom = () => {
      if (!meetingCode || !user) return;
      socket.emit("join-room", {
        meetingCode,
        userId: socket.id,
        userName: user.username,
        dbUserId: user._id,
      });
<<<<<<< HEAD
    };

    if (meetingCode && user && joinedRef.current !== meetingCode) {
      joinedRef.current = meetingCode;
=======
      joinedRef.current = meetingCode;
    };

    if (meetingCode && user && joinedRef.current !== meetingCode) {
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
      if (socket.connected) {
        emitJoinRoom();
      } else {
        socket.once("connect", emitJoinRoom);
      }
    }

<<<<<<< HEAD
    const handleReconnect = () => {
      console.log("[Socket] Reconnected — rejoining room/lobby");
      joinedRef.current = null;

      if (meetingCode && user) {
        setTimeout(() => {
          joinedRef.current = meetingCode;
          socket.emit("join-room", {
            meetingCode,
            userId: socket.id,
            userName: user.username,
            dbUserId: user._id,
          });
=======
    const handleConnect = () => {
      console.log("[Socket] Connected:", socket.id);

      if (meetingCode && user) {
        joinedRef.current = null;
        setTimeout(() => {
          emitJoinRoom();
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
        }, 100);
      } else if (user) {
        socket.emit("join-lobby", user._id);
      }
    };

    if (!meetingCode && user) {
      const emitLobby = () => socket.emit("join-lobby", user._id);
      if (socket.connected) emitLobby();
      else socket.once("connect", emitLobby);
    }

    const handleError = (error: unknown) => {
      console.error("[Socket] Connection error:", error);
    };

<<<<<<< HEAD
    const handleConnect = () => {
      console.log("[Socket] Connected:", socket.id);
    };

    socket.on("reconnect", handleReconnect);
    socket.on("connect_error", handleError);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("reconnect", handleReconnect);
      socket.off("connect_error", handleError);
      socket.off("connect", handleConnect);
=======
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
    };
  }, [meetingCode, user, accessToken]);

  return socketRef.current;
};
