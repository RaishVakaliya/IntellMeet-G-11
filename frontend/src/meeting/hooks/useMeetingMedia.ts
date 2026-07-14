import { toast } from "sonner";
import type { Socket } from "socket.io-client";
import { useMeetingStore } from "@/stores/meetingStore";

export const useMeetingMedia = (
  roomId: string | undefined,
  socket: Socket,
  toggleMicTrack: (enabled: boolean) => void,
  toggleCameraTrack: (enabled: boolean) => void,
  startScreenShare: () => Promise<MediaStream | null>,
  stopScreenShare: () => void,
  startLocalMedia: () => Promise<MediaStream | null>,
) => {
  const { isMuted, isCameraOff, toggleMic, toggleCamera } = useMeetingStore();

  const handleToggleMic = async () => {
    if (!useMeetingStore.getState().localStream) {
      try {
        await startLocalMedia();
      } catch {
        toast.error("Could not access microphone.");
        return;
      }
    }
    const newMutedState = !isMuted;
    toggleMic();
    toggleMicTrack(!newMutedState);
    if (socket.connected) {
      socket.emit("toggle-audio", {
        meetingCode: roomId,
        isMuted: newMutedState,
      });
    }
  };

  const handleToggleCamera = async () => {
    if (!useMeetingStore.getState().localStream) {
      try {
        await startLocalMedia();
      } catch {
        toast.error("Could not access camera. Please check permissions.");
        return;
      }
    }
    const newCameraState = !isCameraOff;
    toggleCamera();
    toggleCameraTrack(!newCameraState);
    if (socket.connected) {
      socket.emit("toggle-video", {
        meetingCode: roomId,
        isCameraOff: newCameraState,
      });
    }
  };

  const handleScreenShare = async () => {
    return await startScreenShare();
  };

  const handleStopScreenShare = () => {
    stopScreenShare();
  };

  return {
    handleToggleMic,
    handleToggleCamera,
    handleScreenShare,
    handleStopScreenShare,
  };
};
