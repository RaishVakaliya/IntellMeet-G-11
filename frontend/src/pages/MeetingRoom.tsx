import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useMeetingStore } from "@/stores/meetingStore";
import {
  endMeeting,
  getMeetingDetails,
  joinMeeting,
  type MeetingDetails,
} from "@/services/meetingService";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import VideoGrid from "@/meeting/VideoGrid";
import ControlsBar from "@/meeting/ControlsBar";
import ChatPanel from "@/meeting/ChatPanel";
import ParticipantList from "@/meeting/ParticipantList";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Check,
  Users,
  ChevronRight,
  ChevronLeft,
  Loader2,
  VideoOff,
} from "lucide-react";
import AppLogoImg from "@/assets/AppLogo.png";
import { Separator } from "@/components/ui/separator";

const MeetingRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    leaveMeeting,
    addParticipant,
    removeParticipant,
    setParticipants,
    isMuted,
    isCameraOff,
    participants,
    toggleMic,
    toggleCamera,
    updateParticipantStream,
    updateParticipantMedia,
  } = useMeetingStore();

  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"chat" | "participants">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const hasHandledMeetingEnd = useRef(false);

  const socket = useSocket(roomId);
  const {
    localVideoRef,
    toggleMicTrack,
    toggleCameraTrack,
    startScreenShare,
    stopScreenShare,
    registerRemoteVideoRef,
  } = useWebRTC({
    meetingCode: roomId!,
    socket,
    onRemoteStream: (peerId, stream) => {
      updateParticipantStream(peerId, stream);
    },
  });

  // Sync store toggles with WebRTC tracks
  const handleToggleMic = () => {
    const newMutedState = !isMuted;
    toggleMic();
    toggleMicTrack(newMutedState);
    if (socket.connected) {
      socket.emit("toggle-audio", {
        meetingCode: roomId,
        userId: socket.id,
        isMuted: newMutedState,
      });
    }
  };
  const handleToggleCamera = () => {
    const newCameraState = !isCameraOff;
    toggleCamera();
    toggleCameraTrack(newCameraState);
    if (socket.connected) {
      socket.emit("toggle-video", {
        meetingCode: roomId,
        userId: socket.id,
        isCameraOff: newCameraState,
      });
    }
  };

  // ── TanStack Query: meeting details (poll every 5s) ───────────
  const { data: meetingDetails, isLoading: meetingLoading } =
    useQuery<MeetingDetails>({
      queryKey: ["meeting-details", roomId],
      queryFn: () => getMeetingDetails(roomId!),
      enabled: !!roomId && !!user,
      refetchInterval: 5000,
    });

  // Watch for meeting ended status
  useEffect(() => {
    if (!meetingDetails) return;
    if (meetingDetails.status === "ended" && !hasHandledMeetingEnd.current) {
      hasHandledMeetingEnd.current = true;
      toast.info("Meeting ended by host");
      leaveMeeting();
      navigate("/dashboard");
    }
  }, [meetingDetails, leaveMeeting, navigate]);

  // ── Rejoin meeting API on mount (handles page reload) ────────
  useEffect(() => {
    if (!roomId) return;
    // Silently call joinMeeting to ensure the participant record exists in DB.
    // Errors (e.g. already joined) are intentionally ignored.
    joinMeeting(roomId).catch(() => {});
  }, [roomId]);

  // ── Socket: existing-users (received when we join a room) ─────
  useEffect(() => {
    const handleExistingUsers = (
      users: {
        userId: string;
        userName: string;
        dbUserId?: string;
        isMuted: boolean;
        isCameraOff: boolean;
      }[],
    ) => {
      const mapped = users.map((u) => ({
        id: u.userId,
        dbUserId: u.dbUserId,
        name: u.userName,
        isMuted: u.isMuted,
        isCameraOff: u.isCameraOff,
        isScreenSharing: false,
        isActiveSpeaker: false,
      }));
      // Replace the participant list with the authoritative server list
      setParticipants(mapped);
    };

    socket.on("existing-users", handleExistingUsers);
    return () => {
      socket.off("existing-users", handleExistingUsers);
    };
  }, [socket, setParticipants]);

  // ── Socket: participant events ───────────────────────────────
  useEffect(() => {
    const handleUserConnected = ({
      userId,
      userName,
      dbUserId,
      isMuted,
      isCameraOff,
    }: {
      userId: string;
      userName: string;
      dbUserId: string;
      isMuted: boolean;
      isCameraOff: boolean;
    }) => {
      addParticipant({
        id: userId,
        dbUserId,
        name: userName,
        isMuted,
        isCameraOff,
        isScreenSharing: false,
        isActiveSpeaker: false,
      });
    };

    const handleUserDisconnected = (userId: string) => {
      removeParticipant(userId);
    };

    const handleAudioToggled = ({
      userId,
      isMuted,
    }: {
      userId: string;
      isMuted: boolean;
    }) => {
      updateParticipantMedia(userId, { isMuted });
    };

    const handleVideoToggled = ({
      userId,
      isCameraOff,
    }: {
      userId: string;
      isCameraOff: boolean;
    }) => {
      updateParticipantMedia(userId, { isCameraOff });
    };

    const handleNotification = (msg: string) => {
      toast.info(msg, { duration: 2500 });
    };

    socket.on("user-connected", handleUserConnected);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("participant-audio-toggled", handleAudioToggled);
    socket.on("participant-video-toggled", handleVideoToggled);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("participant-audio-toggled", handleAudioToggled);
      socket.off("participant-video-toggled", handleVideoToggled);
      socket.off("notification", handleNotification);
    };
  }, [socket, addParticipant, removeParticipant, updateParticipantMedia]);

  // Sync screen share state
  useEffect(() => {
    const handleScreenShareToggled = ({
      userId,
      isScreenSharing,
    }: {
      userId: string;
      isScreenSharing: boolean;
    }) => {
      updateParticipantMedia(userId, { isScreenSharing });
    };

    socket.on("participant-screen-share-toggled", handleScreenShareToggled);
    return () => {
      socket.off("participant-screen-share-toggled", handleScreenShareToggled);
    };
  }, [socket, updateParticipantMedia]);

  // ── Leave – only call endMeeting if user is host ──────────────
  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    // Determine if user is the host
    const isHost =
      meetingDetails?.createdBy?._id === user?._id ||
      meetingDetails?.participants?.some(
        (p) => p.role === "host" && p.user?._id === user?._id,
      );

    if (isHost && roomId) {
      // Host ends the meeting for everyone
      try {
        await endMeeting(roomId);
        toast.success("Meeting ended for everyone");
      } catch {
        // Silently ignore — might already be ended
      }
    }
    // Everyone: clean up local state and navigate away
    leaveMeeting();
    navigate("/dashboard");
  };

  const handleScreenShare = async () => {
    await startScreenShare();
  };
  const handleStopScreenShare = () => {
    stopScreenShare();
  };

  const copyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Meeting code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (meetingLoading) {
    return (
      <div className="h-screen dark bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Joining meeting...</p>
        </div>
      </div>
    );
  }

  // ── Meeting ended screen ──────────────────────────────────────
  if (meetingDetails?.status === "ended") {
    return (
      <div className="h-screen dark bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white font-semibold text-lg">Meeting has ended</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-sm transition-colors"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const participantCount = participants.length + 1;

  return (
    <TooltipProvider>
      <div className="dark h-screen flex flex-col bg-gray-950 text-foreground overflow-hidden">
        {/* ── Top Bar ───────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 py-3 bg-gray-900/80 border-b border-white/5 backdrop-blur-xl shrink-0">
          {/* Logo + title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={AppLogoImg} alt="IntellMeet" className="h-8 w-auto" />
            </div>

            <Separator orientation="vertical" />

            <div className="hidden sm:flex flex-col">
              <p className="text-white text-sm font-medium leading-tight">
                {meetingDetails?.title ?? "Meeting"}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>
                  {participantCount} participant
                  {participantCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <Separator orientation="vertical" />
            {roomId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <span className="font-mono text-xs text-gray-300 tracking-wider">
                      {roomId}
                    </span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Copy meeting code</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Sidebar controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setSidebarTab("participants");
                    setIsSidebarOpen(true);
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Users className="w-4 h-4 text-gray-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Participants</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsSidebarOpen((v) => !v)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  {isSidebarOpen ? (
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isSidebarOpen ? "Hide panel" : "Show panel"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <VideoGrid
              localVideoRef={localVideoRef}
              registerRemoteVideoRef={registerRemoteVideoRef}
            />
            <ControlsBar
              onLeave={handleLeave}
              onScreenShare={handleScreenShare}
              onStopScreenShare={handleStopScreenShare}
              onToggleMic={handleToggleMic}
              onToggleCamera={handleToggleCamera}
            />
          </div>

          {isSidebarOpen && (
            <div className="w-80 flex flex-col border-l border-white/5 bg-gray-900/60 shrink-0">
              {/* Tabs */}
              <div className="flex border-b border-white/5 shrink-0">
                {[
                  { id: "chat", label: "chat" },
                  {
                    id: "participants",
                    label: `participants (${participants.length + 1})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id as any)}
                    className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all ${
                      sidebarTab === tab.id
                        ? "text-emerald-400 border-b-2 border-emerald-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {sidebarTab === "chat" ? (
                <ChatPanel socket={socket} meetingCode={roomId!} />
              ) : (
                <ParticipantList hostId={meetingDetails?.createdBy?._id} />
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MeetingRoom;
