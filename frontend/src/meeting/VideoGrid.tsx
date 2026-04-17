import React from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import VideoTile from "./VideoTile";
import { useAuthStore } from "@/stores/authStore";
import { useAudioDetection } from "@/hooks/useAudioDetection";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  registerRemoteVideoRef: (peerId: string, el: HTMLVideoElement | null) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  registerRemoteVideoRef,
}) => {
  const {
    participants,
    isCameraOff,
    isScreenSharing,
    localStream,
    speakingUsers,
  } = useMeetingStore();
  const { user } = useAuthStore();

  const localUserId = user?._id || "local";
  useAudioDetection(localUserId, localStream || undefined);

  const isLocalSpeaking = speakingUsers[localUserId];

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div
          className={cn(
            "relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300",
            isLocalSpeaking
              ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
              : "border-border"
          )}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover bg-card ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
          />
          {isCameraOff && !isScreenSharing && (
            <div className="absolute inset-0 bg-background flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground text-4xl font-bold shadow-xl select-none">
                {user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
          )}
          {isLocalSpeaking && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-pulse pointer-events-none" />
          )}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/60 backdrop-blur-md border border-border">
            <span className="text-foreground text-sm font-medium">
              {user?.username} (You)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-foreground font-medium">
            Waiting for others to join
          </p>
          <p className="text-muted-foreground text-sm">
            Share the meeting code to invite participants
          </p>
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 grid gap-3 p-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
        alignContent: "start",
      }}
    >
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden bg-card border-2 aspect-video transition-all duration-300",
          isLocalSpeaking
            ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
            : "border-border"
        )}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
        />
        {isCameraOff && !isScreenSharing && (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground text-2xl font-bold select-none shadow-2xl">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        )}
        {isLocalSpeaking && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-pulse pointer-events-none" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-card/80 to-transparent">
          <span className="text-foreground text-sm font-medium">
            {user?.username} (You)
          </span>
        </div>
      </div>

      {participants.map((p) => (
        <VideoTile
          key={p.id}
          participant={p}
          registerVideoRef={(el) => registerRemoteVideoRef(p.id, el)}
        />
      ))}
    </div>
  );
};

export default VideoGrid;

