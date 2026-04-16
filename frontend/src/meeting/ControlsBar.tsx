import React from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
=======
import { toast } from "sonner";
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

interface ControlsBarProps {
  onLeave: () => void;
  onScreenShare: () => Promise<void>;
  onStopScreenShare?: () => void;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  isHost?: boolean;
  className?: string;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  onLeave,
  onScreenShare,
  onStopScreenShare,
  onToggleMic,
  onToggleCamera,
  isHost,
  className,
}) => {
  const {
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useMeetingStore();

  const handleToggleMic = onToggleMic ?? toggleMic;
  const handleToggleCamera = onToggleCamera ?? toggleCamera;

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await onStopScreenShare?.();
      toggleScreenShare();
    } else {
      try {
        await onScreenShare();
        toggleScreenShare();
      } catch (err) {
        console.warn("Screen share cancelled or failed");
      }
    }
  };

  return (
    <div
      className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
<<<<<<< HEAD
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
=======
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleMic}
              size="icon-lg"
              className={cn(
<<<<<<< HEAD
                "rounded-xl transition-all",
                isMuted
                  ? "bg-red-500/80 hover:bg-red-500"
                  : "bg-white/10 hover:bg-white/20",
=======
                "rounded-xl transition-all border-2 border-border",
                isMuted
                  ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              )}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isMuted ? "Unmute" : "Mute"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleCamera}
              size="icon-lg"
              className={cn(
<<<<<<< HEAD
                "rounded-xl transition-all",
                isCameraOff
                  ? "bg-red-500/80 hover:bg-red-500"
                  : "bg-white/10 hover:bg-white/20",
=======
                "rounded-xl transition-all border-2 border-border",
                isCameraOff
                  ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              )}
            >
              {isCameraOff ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isCameraOff ? "Turn on camera" : "Turn off camera"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleScreenShare}
              size="icon-lg"
              className={cn(
<<<<<<< HEAD
                "rounded-xl transition-all",
                isScreenSharing
                  ? "bg-emerald-600/80 hover:bg-emerald-600"
                  : "bg-white/10 hover:bg-white/20",
=======
                "rounded-xl transition-all border-2 border-border",
                isScreenSharing
                  ? "bg-primary/80 hover:bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              )}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isScreenSharing ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

<<<<<<< HEAD
        <div className="w-px h-6 bg-white/10 mx-1" />
=======
        <div className="w-px h-6 bg-border mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              className="rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all group border-2 border-border"
              onClick={() => toast.info("Recording feature coming soon!")}
            >
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse group-hover:scale-110 transition-transform" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Record Meeting</TooltipContent>
        </Tooltip>
        <div className="w-px h-6 bg-border mx-1" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLeave}
<<<<<<< HEAD
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 h-11"
=======
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 h-11"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            >
              <PhoneOff className="w-4 h-4 mr-1.5" />
              <span className="font-semibold">
                {isHost ? "End Meeting" : "Leave"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
<<<<<<< HEAD
            className="bg-red-600 text-white border-none"
=======
            className="bg-destructive text-destructive-foreground border-none"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
          >
            {isHost ? "End meeting for everyone" : "Leave meeting"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ControlsBar;
