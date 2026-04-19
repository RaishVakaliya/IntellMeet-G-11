import { useEffect, useRef, useCallback } from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import { toast } from "sonner";

interface UseWebRTCOptions {
  meetingCode: string;
  socket: import("socket.io-client").Socket;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
}

interface ExistingUser {
  socketId: string;
  dbUserId: string;
  userName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = ({
  meetingCode,
  socket,
  onRemoteStream,
}: UseWebRTCOptions) => {
  if (!meetingCode) {
    return {
      localVideoRef: { current: null },
      localStreamRef: { current: null },
      toggleMicTrack: () => {},
      toggleCameraTrack: () => {},
      startScreenShare: async () => null,
      stopScreenShare: () => {},
      startLocalMedia: async () => null,
      registerRemoteVideoRef: () => {},
      peerConnections: new Map(),
    };
  }
  const { setLocalStream } = useMeetingStore();

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerSocketIdMap = useRef<Map<string, string>>(new Map());
  const mediaReadyRef = useRef<boolean>(false);
  const pendingSignals = useRef<Array<() => Promise<void>>>([]);

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const { isMuted: initMuted, isCameraOff: initCameraOff } =
        useMeetingStore.getState();
      stream.getAudioTracks().forEach((t) => (t.enabled = !initMuted));
      stream.getVideoTracks().forEach((t) => (t.enabled = !initCameraOff));

      mediaReadyRef.current = true;

      for (const fn of pendingSignals.current) {
        await fn();
      }
      pendingSignals.current = [];

      return stream;
    } catch (err) {
      console.warn("getUserMedia failed:", err);
      mediaReadyRef.current = true;
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (dbUserId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(dbUserId);
      if (existing) {
        existing.close();
        peersRef.current.delete(dbUserId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      const tracks = localStreamRef.current?.getTracks() ?? [];
      tracks.forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          const targetSocketId = peerSocketIdMap.current.get(dbUserId);
          if (targetSocketId) {
            socket.emit("ice-candidate", {
              target: targetSocketId,
              candidate,
            });
          }
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        const existingEl = remoteVideoRefs.current.get(dbUserId);
        if (existingEl) {
          existingEl.srcObject = remoteStream;
        }

        onRemoteStream?.(dbUserId, remoteStream);
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          pc.close();
          peersRef.current.delete(dbUserId);
        }
      };

      peersRef.current.set(dbUserId, pc);
      return pc;
    },
    [socket, onRemoteStream]
  );

  const toggleMicTrack = useCallback((enabled: boolean) => {
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = enabled));
  }, []);

  const toggleCameraTrack = useCallback((enabled: boolean) => {
    localStreamRef.current
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = enabled));
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      const videoTrack = screenStream.getVideoTracks()[0];

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      for (const [dbId, pc] of peersRef.current.entries()) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, screenStream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const targetSocketId = peerSocketIdMap.current.get(dbId);
          if (targetSocketId) {
            socket.emit("offer", {
              target: targetSocketId,
              caller: socket.id,
              sdp: offer,
            });
          }
        }
      }

      socket.emit("toggle-screen-share", {
        meetingCode,
        isScreenSharing: true,
      });

      videoTrack.onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.warn("Screen share failed:", err);
      return null;
    }
  }, [socket, meetingCode]);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    peersRef.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      sender?.replaceTrack(cameraTrack);
    });

    socket.emit("toggle-screen-share", {
      meetingCode,
      isScreenSharing: false,
    });
  }, [socket, meetingCode]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localVideoRef.current, localStreamRef.current]);

  const registerRemoteVideoRef = useCallback(
    (peerId: string, el: HTMLVideoElement | null) => {
      if (el) {
        remoteVideoRefs.current.set(peerId, el);
      } else {
        remoteVideoRefs.current.delete(peerId);
      }
    },
    [],
  );

  useEffect(() => {
    startLocalMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      peerSocketIdMap.current.clear();
      remoteVideoRefs.current.clear();
      mediaReadyRef.current = false;
      pendingSignals.current = [];
    };
  }, []);

  return {
    localVideoRef,
    localStreamRef,
    toggleMicTrack,
    toggleCameraTrack,
    startScreenShare,
    stopScreenShare,
    startLocalMedia,
    registerRemoteVideoRef,
  };
};

