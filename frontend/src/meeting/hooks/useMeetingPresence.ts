import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { useMeetingStore } from "@/stores/meetingStore";

export const useMeetingPresence = (socket: Socket) => {
  const { addOnlineUser, removeOnlineUser } = useMeetingStore();

  useEffect(() => {
    const handleOnline = ({ dbUserId }: { dbUserId: string }) => {
      addOnlineUser(dbUserId);
    };
    const handleOffline = ({ dbUserId }: { dbUserId: string }) => {
      removeOnlineUser(dbUserId);
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);
    return () => {
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
    };
  }, [socket, addOnlineUser, removeOnlineUser]);
};
