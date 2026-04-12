import { useEffect, useRef, useCallback } from "react";
import { useMeetingStore } from "@/stores/meetingStore";

interface UseWebRTCOptions {
  meetingCode: string;
  socket: import("socket.io-client").Socket;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
}

interface ExistingUser {
  userId: string;
  userName: string;
  dbUserId?: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = ({ socket, onRemoteStream }: UseWebRTCOptions) => {
  const { isMuted, isCameraOff, setLocalStream } = useMeetingStore();

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const screenStreamRef = useRef<MediaStream | null>(null);

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

      stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
      stream.getVideoTracks().forEach((t) => (t.enabled = !isCameraOff));

      return stream;
    } catch (err) {
      console.warn("getUserMedia failed:", err);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        existing.close();
        peersRef.current.delete(peerId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      const tracks = localStreamRef.current?.getTracks() ?? [];
      tracks.forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("ice-candidate", { target: peerId, candidate });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        const existingEl = remoteVideoRefs.current.get(peerId);
        if (existingEl) {
          existingEl.srcObject = remoteStream;
        }

        onRemoteStream?.(peerId, remoteStream);
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          pc.close();
          peersRef.current.delete(peerId);
        }
      };

      peersRef.current.set(peerId, pc);
      return pc;
    },
    [socket, onRemoteStream],
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

      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(videoTrack);
      });

      socket.emit("toggle-screen-share", {
        meetingCode: socket.id,
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
  }, [socket]);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(cameraTrack);
      });
    }

    socket.emit("toggle-screen-share", {
      meetingCode: socket.id,
      isScreenSharing: false,
    });
  }, [socket]);
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
    const handleUserConnected = async ({
      userId,
      userName,
    }: {
      userId: string;
      userName: string;
    }) => {
      console.log(
        "[WebRTC] user-connected — initiating offer to:",
        userId,
        userName,
      );
      const pc = createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", {
        target: userId,
        caller: socket.id,
        sdp: offer,
      });
    };

    const handleExistingUsers = async (users: ExistingUser[]) => {
      console.log("[WebRTC] existing-users received:", users.length, "peers");
      for (const u of users) {
        if (!u.userId || u.userId === socket.id) continue;
        console.log("[WebRTC] initiating offer to existing peer:", u.userId);
        const pc = createPeerConnection(u.userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", {
          target: u.userId,
          caller: socket.id,
          sdp: offer,
        });
      }
    };

    const handleOffer = async (payload: {
      caller: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      console.log("[WebRTC] received offer from", payload.caller);
      const pc = createPeerConnection(payload.caller);
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", {
        target: payload.caller,
        caller: socket.id,
        sdp: answer,
      });
    };

    const handleAnswer = async (payload: {
      caller: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      console.log("[WebRTC] received answer from", payload.caller);
      const pc = peersRef.current.get(payload.caller);
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
    };

    const handleIceCandidate = async (incoming: {
      target: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const pc = peersRef.current.get(incoming.target);
      try {
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(incoming.candidate));
        }
      } catch (e) {
        console.warn("ICE candidate error:", e);
      }
    };

    const handleUserDisconnected = (userId: string) => {
      const pc = peersRef.current.get(userId);
      if (pc) {
        pc.close();
        peersRef.current.delete(userId);
      }
      remoteVideoRefs.current.delete(userId);
    };

    socket.on("user-connected", handleUserConnected);
    socket.on("existing-users", handleExistingUsers);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("existing-users", handleExistingUsers);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [socket, createPeerConnection]);

  useEffect(() => {
    startLocalMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      remoteVideoRefs.current.clear();
    };
  }, []);

  return {
    localVideoRef,
    localStreamRef,
    toggleMicTrack,
    toggleCameraTrack,
    startScreenShare,
    stopScreenShare,
    registerRemoteVideoRef,
  };
};
