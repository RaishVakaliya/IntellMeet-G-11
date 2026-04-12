import React from "react";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/meeting";
import { MicOff, VideoOff, Wifi } from "lucide-react";

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
        "relative rounded-2xl overflow-hidden bg-gray-900 border-2 transition-all duration-300",
        participant.isActiveSpeaker
          ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          : "border-white/5 hover:border-white/15",
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
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg select-none">
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
        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 animate-pulse pointer-events-none" />
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {participant.isActiveSpeaker && (
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          )}
          <span className="text-white text-sm font-medium truncate max-w-[120px]">
            {participant.name}
            {isLocal ? " (You)" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {participant.isMuted && (
            <div className="bg-red-500/90 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isCameraOff && (
            <div className="bg-gray-600/90 rounded-full p-1">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
