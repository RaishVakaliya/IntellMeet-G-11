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
import { toast } from "sonner";

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
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/40 backdrop-blur-2xl border border-border shadow-2xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleMic}
              size="icon"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isMuted
                  ? "bg-destructive hover:bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
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
            {isMuted ? "Unmute microphone" : "Mute microphone"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleCamera}
              size="icon"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isCameraOff
                  ? "bg-destructive hover:bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
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
            {isCameraOff ? "Turn camera on" : "Turn camera off"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleScreenShare}
              size="icon"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isScreenSharing
                  ? "bg-primary hover:bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground",
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
            {isScreenSharing ? "Stop screen sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-10 bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="rounded-xl bg-muted hover:bg-muted/80 text-foreground border-2 border-border group transition-all"
              onClick={() => toast.info("Recording feature coming soon!", { duration: 3000 })}
            >
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse group-hover:scale-110 transition-all duration-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Record meeting</TooltipContent>
        </Tooltip>

        <div className="w-px h-10 bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLeave}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 h-11 shadow-2xl font-semibold"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              {isHost ? "End Meeting" : "Leave"}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-destructive text-destructive-foreground border-destructive/50"
          >
            {isHost ? "End meeting for everyone" : "Leave meeting"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ControlsBar;

