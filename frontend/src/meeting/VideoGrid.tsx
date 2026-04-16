import React from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import VideoTile from "./VideoTile";
import { useAuthStore } from "@/stores/authStore";
<<<<<<< HEAD
=======
import { useAudioDetection } from "@/hooks/useAudioDetection";
import { cn } from "@/lib/utils";
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  registerRemoteVideoRef: (peerId: string, el: HTMLVideoElement | null) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  registerRemoteVideoRef,
}) => {
<<<<<<< HEAD
  const { participants, isCameraOff, isScreenSharing } = useMeetingStore();
  const { user } = useAuthStore();

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="relative w-full max-w-3xl aspect-video">
=======
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
              : "border-border",
          )}
        >
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
<<<<<<< HEAD
            className={`w-full h-full rounded-2xl object-cover bg-gray-900 border-2 border-white/5 ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
          />
          {isCameraOff && !isScreenSharing && (
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-white/5">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl select-none">
=======
            className={`w-full h-full object-cover bg-card ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
          />
          {isCameraOff && !isScreenSharing && (
            <div className="absolute inset-0 w-full h-full bg-background flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-4xl font-bold shadow-xl select-none">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                {user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
          )}
<<<<<<< HEAD
          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-white text-sm font-medium">
=======
          {isLocalSpeaking && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-pulse pointer-events-none" />
          )}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/60 backdrop-blur-md border border-border">
            <span className="text-foreground text-sm font-medium">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              {user?.username} (You)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
<<<<<<< HEAD
          <p className="text-gray-300 font-medium">
            Waiting for others to join
          </p>
          <p className="text-gray-500 text-sm">
=======
          <p className="text-foreground font-medium">
            Waiting for others to join
          </p>
          <p className="text-muted-foreground text-sm">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            Share the meeting code to invite participants
          </p>
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
<<<<<<< HEAD
                className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce"
=======
                className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
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
        alignContent: "center",
      }}
    >
<<<<<<< HEAD
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-white/5 aspect-video">
=======
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden bg-card border-2 aspect-video transition-all duration-300",
          isLocalSpeaking
            ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
            : "border-border",
        )}
      >
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
        />
        {isCameraOff && !isScreenSharing && (
<<<<<<< HEAD
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-2xl font-bold select-none">
=======
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground text-2xl font-bold select-none shadow-2xl">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        )}
<<<<<<< HEAD
=======
        {isLocalSpeaking && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-pulse pointer-events-none" />
        )}
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-white text-sm font-medium">
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
