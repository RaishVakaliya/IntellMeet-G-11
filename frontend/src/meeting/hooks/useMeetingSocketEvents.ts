import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMeetingStore } from "@/stores/meetingStore";
import type { Socket } from "socket.io-client";
import type { User } from "@/types/auth";

export const useMeetingSocketEvents = (
  socket: Socket,
  roomId: string | undefined,
  user: User | null,
) => {
  const navigate = useNavigate();
  const {
    addParticipant,
    removeParticipant,
    updateParticipantMedia,
    addOnlineUser,
    removeOnlineUser,
  } = useMeetingStore();

  useEffect(() => {
    const handleExistingUsers = (
      usersList: {
        socketId: string;
        dbUserId: string;
        userName: string;
        isMuted: boolean;
        isCameraOff: boolean;
        isScreenSharing: boolean;
      }[],
    ) => {
      usersList.forEach((u) => {
        if (u.dbUserId === user?._id) return;

        addParticipant({
          id: u.dbUserId,
          socketId: u.socketId,
          name: u.userName,
          isMuted: u.isMuted,
          isCameraOff: u.isCameraOff,
          isScreenSharing: u.isScreenSharing,
          isActiveSpeaker: false,
        });

        addOnlineUser(u.dbUserId);
      });

      if (socket.connected && roomId) {
        const { isMuted: localMuted, isCameraOff: localCameraOff } =
          useMeetingStore.getState();
        socket.emit("sync-media-state", {
          meetingCode: roomId,
          isMuted: localMuted,
          isCameraOff: localCameraOff,
        });
      }
    };

    socket.on("existing-users", handleExistingUsers);
    return () => {
      socket.off("existing-users", handleExistingUsers);
    };
  }, [socket, addParticipant, addOnlineUser, user, roomId]);

  useEffect(() => {
    const handleUserConnected = ({
      socketId,
      dbUserId,
      userName,
      isMuted,
      isCameraOff,
      isScreenSharing,
    }: {
      socketId: string;
      dbUserId: string;
      userName: string;
      isMuted: boolean;
      isCameraOff: boolean;
      isScreenSharing: boolean;
    }) => {
      addParticipant({
        id: dbUserId,
        socketId,
        name: userName,
        isMuted,
        isCameraOff,
        isScreenSharing,
        isActiveSpeaker: false,
      });
      addOnlineUser(dbUserId);
    };

    const handleUserDisconnected = ({ dbUserId }: { dbUserId: string }) => {
      removeParticipant(dbUserId);
      removeOnlineUser(dbUserId);
    };

    const handleAudioToggled = ({
      dbUserId,
      isMuted,
    }: {
      dbUserId: string;
      isMuted: boolean;
    }) => {
      updateParticipantMedia(dbUserId, { isMuted });
    };

    const handleVideoToggled = ({
      dbUserId,
      isCameraOff,
    }: {
      dbUserId: string;
      isCameraOff: boolean;
    }) => {
      updateParticipantMedia(dbUserId, { isCameraOff });
    };

    const handleNotification = (msg: string) => {
      toast.info(msg, { duration: 2500 });
    };

    const handleErrorMessage = (msg: string) => {
      toast.error(msg);
      navigate("/dashboard");
    };

    socket.on("user-connected", handleUserConnected);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("participant-audio-toggled", handleAudioToggled);
    socket.on("participant-video-toggled", handleVideoToggled);
    socket.on("notification", handleNotification);
    socket.on("error-message", handleErrorMessage);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("participant-audio-toggled", handleAudioToggled);
      socket.off("participant-video-toggled", handleVideoToggled);
      socket.off("notification", handleNotification);
      socket.off("error-message", handleErrorMessage);
    };
  }, [
    socket,
    addParticipant,
    removeParticipant,
    updateParticipantMedia,
    addOnlineUser,
    removeOnlineUser,
    navigate,
  ]);

  useEffect(() => {
    const handleScreenShareToggled = ({
      dbUserId,
      isScreenSharing,
    }: {
      dbUserId: string;
      isScreenSharing: boolean;
    }) => {
      updateParticipantMedia(dbUserId, { isScreenSharing });
    };

    socket.on("participant-screen-share-toggled", handleScreenShareToggled);
    return () => {
      socket.off("participant-screen-share-toggled", handleScreenShareToggled);
    };
  }, [socket, updateParticipantMedia]);

  useEffect(() => {
    const handleMediaSync = ({
      dbUserId,
      isMuted,
      isCameraOff,
      isScreenSharing,
    }: {
      dbUserId: string;
      isMuted: boolean;
      isCameraOff: boolean;
      isScreenSharing: boolean;
    }) => {
      updateParticipantMedia(dbUserId, {
        isMuted,
        isCameraOff,
        isScreenSharing,
      });
    };

    socket.on("participant-media-sync", handleMediaSync);
    return () => {
      socket.off("participant-media-sync", handleMediaSync);
    };
  }, [socket, updateParticipantMedia]);
};
