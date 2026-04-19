import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Check,
  Copy,
  VideoOff,
  ChevronLeft,
  Mic,
  MicOff,
  Video,
  ScreenShare,
  PhoneOff,
  Users,
  ChevronRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { useMeetingStore } from "../stores/meetingStore";
import { useAuthStore } from "../stores/authStore";
import { getMeetingDetails, endMeeting } from "../services/meetingService";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useAudioDetection } from "../hooks/useAudioDetection";
import { DashboardLayout } from "../layouts/DashboardLayout";
import VideoGrid from "../meeting/VideoGrid";
import ControlsBar from "../meeting/ControlsBar";
import ChatPanel from "../meeting/ChatPanel";
import ParticipantList from "../meeting/ParticipantList";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    participants,
    messages,
    typingUsers,
    speakingUsers,
    onlineUsers,
    localStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    roomId,
    removeParticipant,
    setParticipants,
    addParticipant,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    updateParticipantMedia,
  } = useMeetingStore();

  const socket = useSocket();

  const {
    peerConnections,
    localVideoRef,
    registerRemoteVideoRef,
    startLocalMedia,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC({ 
    meetingCode: code!, 
    socket, 
    onRemoteStream: undefined 
  });

  const audioDetection = localStream ? useAudioDetection("local", localStream) : { audioLevel: 0, isSpeaking: false };

  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"participants" | "chat">("participants");

  const queryMeetingDetails = useQuery({
    queryKey: ["meeting", code],
    queryFn: () => getMeetingDetails(code!),
    enabled: !!code,
  });

  const isHost =
    queryMeetingDetails.data?.createdBy?._id === useAuthStore.getState().user?._id;

  const joinMeeting = useCallback(
    (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket) return reject(new Error("No socket"));
        socket.emit("join-meeting", { meetingCode: id }, (err?: string) => {
          if (err) reject(new Error(err));
          else resolve();
        });
      });
    },
    [socket]
  );

  const meetingDetails = queryMeetingDetails.data;

  useEffect(() => {
    if (!roomId || !queryMeetingDetails.data) return;
    joinMeeting(roomId)
      .then(() => setIsJoining(false))
      .catch(() => {
        toast.error("Failed to join analytics session");
        navigate("/dashboard");
      });
  }, [roomId, queryMeetingDetails.data, joinMeeting, navigate]);

  // Set roomId when meeting details load
  useEffect(() => {
    if (queryMeetingDetails.data?.meetingCode && !roomId) {
      useMeetingStore.getState().setRoomId(queryMeetingDetails.data.meetingCode);
    }
  }, [queryMeetingDetails.data, roomId]);

  const copyCode = () => {
    navigator.clipboard.writeText(code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveMeeting = () => {
    if (code) endMeeting(code);
    navigate("/dashboard");
  };

  const handleToggleMic = async () => {
    const newMutedState = !isMuted;
    socket?.emit("toggle-audio", {
      meetingCode: roomId,
      isMuted: newMutedState,
    });
    updateParticipantMedia("local", { isMuted: newMutedState });
  };

  const handleToggleCamera = async () => {
    const newCameraState = !isCameraOff;
    socket?.emit("toggle-video", {
      meetingCode: roomId,
      isCameraOff: newCameraState,
    });
    updateParticipantMedia("local", { isCameraOff: newCameraState });
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
      socket?.emit("toggle-screen-share", {
        meetingCode: roomId,
        isScreenSharing: false,
      });
    } else {
      startScreenShare();
    }
    updateParticipantMedia("local", { isScreenSharing: !isScreenSharing });
  };

  useEffect(() => {
    const handleUserConnected = (userData: any) => {
      addParticipant({ ...userData, stream: null });
      addOnlineUser(userData.dbUserId);
    };

    const handleUserDisconnected = (data: { dbUserId: string }) => {
      removeParticipant(data.dbUserId);
      removeOnlineUser(data.dbUserId);
    };

    const handleExistingUsers = (users: any[]) => {
      const mapped = users.map((user) => ({
        ...user,
        socketId: user.socketId,
        id: user.dbUserId,
        stream: null,
      }));
      setParticipants(mapped);
      setOnlineUsers(users.map((u) => u.dbUserId));
    };

    socket?.on("user-connected", handleUserConnected);
    socket?.on("user-disconnected", handleUserDisconnected);
    socket?.on("existing-users", handleExistingUsers);
    socket?.on("participant-audio-toggled", (data: any) =>
      updateParticipantMedia(data.dbUserId, { isMuted: data.isMuted })
    );
    socket?.on("participant-video-toggled", (data: any) =>
      updateParticipantMedia(data.dbUserId, { isCameraOff: data.isCameraOff })
    );
    socket?.on("participant-screen-share-toggled", (data: any) =>
      updateParticipantMedia(data.dbUserId, {
        isScreenSharing: data.isScreenSharing,
      })
    );
    socket?.on("meeting-ended", () => {
      toast("Session ended");
      navigate("/dashboard");
    });

    return () => {
      socket?.off("user-connected", handleUserConnected);
      socket?.off("user-disconnected", handleUserDisconnected);
      socket?.off("existing-users", handleExistingUsers);
      socket?.off("participant-audio-toggled");
      socket?.off("participant-video-toggled");
      socket?.off("participant-screen-share-toggled");
      socket?.off("meeting-ended");
    };
  }, [
    socket,
    addParticipant,
    removeParticipant,
    setParticipants,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    updateParticipantMedia,
    navigate,
    roomId,
  ]);

  if (isJoining) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!queryMeetingDetails.data) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive text-sm">Analytics session not found</p>
        <Button variant="destructive" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const activeCount = queryMeetingDetails.data!.participants?.length ?? 0;

  return (
    <TooltipProvider>
      <div className="dark h-screen flex flex-col bg-background/95 text-foreground overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-white/5 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsSidebarOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{code} Analytics</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Session ID: {code}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCode}
                  className="h-6 mt-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="h-5 px-2">
                {activeCount} Active
              </Badge>
              <Badge
                variant="default"
                className="h-5 px-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              >
                Live Data
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Analytics Dashboard</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveMeeting}
              className="h-8 px-3"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`transition-all duration-300 ${
              isSidebarOpen ? "w-80" : "w-0"
            } flex flex-col border-l border-white/5 bg-card/10 shrink-0`}
          >
            <div className="flex border-b border-white/5 shrink-0">
              <button
                onClick={() => setSidebarTab("participants")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  sidebarTab === "participants"
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Participants
              </button>
              <button
                onClick={() => setSidebarTab("chat")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  sidebarTab === "chat"
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Logs
              </button>
            </div>
            {sidebarTab === "participants" && (
              <ParticipantList participants={participants} />
            )}
            {sidebarTab === "chat" && (
              <ChatPanel messages={messages} typingUsers={typingUsers} />
            )}
          </div>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-auto">
              <VideoGrid
                participants={participants}
                peerConnections={peerConnections}
                registerRemoteVideoRef={registerRemoteVideoRef}
              />
            </div>
            <ControlsBar
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              isScreenSharing={isScreenSharing}
              onToggleMic={handleToggleMic}
              onToggleCamera={handleToggleCamera}
              onToggleScreenShare={handleToggleScreenShare}
              onLeave={handleLeaveMeeting}
              localVideoRef={localVideoRef}
              audioLevel={audioDetection.audioLevel}
            />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
