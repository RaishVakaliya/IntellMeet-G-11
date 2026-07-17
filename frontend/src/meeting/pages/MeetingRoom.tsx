import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMeetingStore } from "@/stores/meetingStore";
import {
  getMeetingDetails,
  type MeetingDetails,
} from "@/services/meetingService";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import VideoGrid, { type CallLayoutType } from "@/meeting/VideoGrid";
import ControlsBar from "@/meeting/ControlsBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMeetingRecording } from "@/hooks/useMeetingRecording";
import { useLiveTranscription } from "@/hooks/useLiveTranscription";
import { useDocumentSEO } from "@/hooks/useDocumentSEO";

import { MeetingHeader } from "../components/MeetingHeader";
import { MeetingSidebar } from "../components/MeetingSidebar";
import { MeetingLoading } from "../components/MeetingLoading";
import { MeetingEnded } from "../components/MeetingEnded";
import { useMeetingLifecycle } from "../hooks/useMeetingLifecycle";
import { useMeetingMedia } from "../hooks/useMeetingMedia";
import { useMeetingSocketEvents } from "../hooks/useMeetingSocketEvents";
import { useShallow } from "zustand/react/shallow";

const MeetingRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { participants, updateParticipantStream, leaveMeeting } =
    useMeetingStore(
      useShallow((s) => ({
        participants: s.participants,
        updateParticipantStream: s.updateParticipantStream,
        leaveMeeting: s.leaveMeeting,
      })),
    );

  const [copied, setCopied] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<
    "chat" | "participants" | "captions"
  >("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layout, setLayout] = useState<CallLayoutType>("grid");

  const { isRecording, isUploading, startRecording, stopRecording } =
    useMeetingRecording(roomId!);
  useLiveTranscription(true);

  const socket = useSocket(roomId);
  const {
    localVideoRef,
    toggleMicTrack,
    toggleCameraTrack,
    startScreenShare,
    stopScreenShare,
    startLocalMedia,
    registerRemoteVideoRef,
  } = useWebRTC({
    meetingCode: roomId!,
    currentUserId: user?._id ?? "",
    socket,
    onRemoteStream: (peerId, stream) => {
      updateParticipantStream(peerId, stream);
    },
  });

  // Fetch Meeting Details
  const { data: meetingDetails, isLoading: meetingLoading } =
    useQuery<MeetingDetails>({
      queryKey: ["meeting-details", roomId],
      queryFn: () => getMeetingDetails(roomId!),
      enabled: !!roomId && !!user,
      staleTime: 30_000,
    });

  const isHost =
    meetingDetails?.createdBy?._id === user?._id ||
    meetingDetails?.participants?.some((p) => {
      if (p.role !== "host") return false;
      const participantUserId =
        typeof p.user === "string" ? p.user : p.user?._id;
      return participantUserId === user?._id;
    });

  // Initialize lifecycle and socket listeners hooks
  const { hasHandledMeetingEnd, handleLeave } = useMeetingLifecycle(
    roomId,
    socket,
    queryClient,
    Boolean(isHost),
  );

  useMeetingSocketEvents(socket, roomId, user);

  const {
    handleToggleMic,
    handleToggleCamera,
    handleScreenShare,
    handleStopScreenShare,
  } = useMeetingMedia(
    roomId,
    socket,
    toggleMicTrack,
    toggleCameraTrack,
    startScreenShare,
    stopScreenShare,
    startLocalMedia,
  );

  useDocumentSEO({
    title: meetingDetails?.title
      ? `${meetingDetails.title} — Meeting Room`
      : roomId
        ? `Meeting ${roomId}`
        : "Meeting Room",
    description:
      "Active IntellMeet video meeting with real-time chat, live captions, and participant controls.",
  });

  // Redirect if ended
  useEffect(() => {
    if (!meetingDetails) return;
    if (meetingDetails.status === "ended" && !hasHandledMeetingEnd.current) {
      hasHandledMeetingEnd.current = true;
      toast.info("Meeting has already ended");
      leaveMeeting();
      navigate("/dashboard");
    }
  }, [meetingDetails, leaveMeeting, navigate, hasHandledMeetingEnd]);

  if (meetingLoading) return <MeetingLoading />;
  if (meetingDetails?.status === "ended") {
    return <MeetingEnded onBack={() => navigate("/dashboard")} />;
  }

  const copyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Meeting code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <TooltipProvider>
      <main
        aria-label="Meeting room"
        className="dark h-screen flex flex-col bg-background/95 text-foreground overflow-hidden"
      >
        <MeetingHeader
          title={meetingDetails?.title}
          meetingCode={roomId ?? ""}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              <VideoGrid
                localVideoRef={localVideoRef}
                registerRemoteVideoRef={registerRemoteVideoRef}
                layout={layout}
              />
            </div>
            <div className="shrink-0 pb-4 pt-1 flex items-center bg-background/50">
              <ControlsBar
                onLeave={handleLeave}
                onScreenShare={handleScreenShare}
                onStopScreenShare={handleStopScreenShare}
                onToggleMic={handleToggleMic}
                onToggleCamera={handleToggleCamera}
                isHost={Boolean(isHost)}
                layout={layout}
                onLayoutChange={setLayout}
                meetingTitle={meetingDetails?.title}
                participantCount={participants.length + 1}
                meetingCode={roomId ?? ""}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
                onCopyCode={copyCode}
                isCopied={copied}
                isRecording={isRecording}
                isUploading={isUploading}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
              />
            </div>
          </div>

          <MeetingSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            participantsCount={participants.length + 1}
            socket={socket}
            roomId={roomId!}
            hostId={meetingDetails?.createdBy?._id}
          />
        </div>
      </main>
    </TooltipProvider>
  );
};

export default MeetingRoom;
