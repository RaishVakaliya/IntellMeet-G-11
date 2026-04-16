import React from "react";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/meeting";
import { MicOff, VideoOff, Wifi } from "lucide-react";
<<<<<<< HEAD
=======
import { useAudioDetection } from "@/hooks/useAudioDetection";
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

interface VideoTileProps {
  participant: Participant;
  isLocal?: boolean;
  className?: string;
  registerVideoRef?: (el: HTMLVideoElement | null) => void;
}

const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal = false,
  className,
  registerVideoRef,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

<<<<<<< HEAD
=======
  useAudioDetection(participant.id, participant.stream);

>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
  const setRef = React.useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      registerVideoRef?.(el);
      if (el && participant.stream) {
        el.srcObject = participant.stream;
      }
    },
    [registerVideoRef, participant.stream],
  );

  React.useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const showVideo =
    (!participant.isCameraOff || participant.isScreenSharing) &&
    !!participant.stream;
  const initial = participant.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div
      className={cn(
<<<<<<< HEAD
        "relative rounded-2xl overflow-hidden bg-gray-900 border-2 transition-all duration-300",
        participant.isActiveSpeaker
          ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          : "border-white/5 hover:border-white/15",
=======
        "relative rounded-2xl overflow-hidden bg-card border-2 transition-all duration-300",
        participant.isActiveSpeaker
          ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
          : "border-border hover:border-border/50",
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
        className,
      )}
    >
      <video
        ref={setRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={cn("w-full h-full object-cover", !showVideo && "hidden")}
      />

      {!showVideo && (
<<<<<<< HEAD
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg select-none">
=======
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground text-2xl font-bold shadow-lg select-none">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </div>
      )}

      {participant.isActiveSpeaker && (
<<<<<<< HEAD
        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 animate-pulse pointer-events-none" />
=======
        <div className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-pulse pointer-events-none" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {participant.isActiveSpeaker && (
<<<<<<< HEAD
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          )}
          <span className="text-white text-sm font-medium truncate max-w-[120px]">
=======
            <Wifi className="w-3 h-3 text-primary animate-pulse" />
          )}
          <span className="text-foreground text-sm font-medium truncate max-w-[120px]">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            {participant.name}
            {isLocal ? " (You)" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {participant.isMuted && (
<<<<<<< HEAD
            <div className="bg-red-500/90 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isCameraOff && (
            <div className="bg-gray-600/90 rounded-full p-1">
              <VideoOff className="w-3 h-3 text-white" />
=======
            <div className="bg-destructive/90 rounded-full p-1 border border-border">
              <MicOff className="w-3 h-3 text-destructive-foreground" />
            </div>
          )}
          {participant.isCameraOff && (
            <div className="bg-muted rounded-full p-1 border border-border">
              <VideoOff className="w-3 h-3 text-foreground" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
