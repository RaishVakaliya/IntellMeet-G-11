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
  LayoutGrid,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CallLayoutType } from "./VideoGrid";

interface ControlsBarProps {
  onLeave: () => void;
  onScreenShare: () => Promise<void>;
  onStopScreenShare?: () => void;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  isHost?: boolean;
  className?: string;
  layout?: CallLayoutType;
  onLayoutChange?: (layout: CallLayoutType) => void;
}

const layoutMeta: Record<
  CallLayoutType,
  { icon: React.ReactNode; label: string; next: CallLayoutType }
> = {
  grid: {
    icon: <LayoutGrid className="w-5 h-5" />,
    label: "Grid layout",
    next: "speaker-left",
  },
  "speaker-left": {
    icon: <PanelLeft className="w-5 h-5" />,
    label: "Speaker left",
    next: "speaker-right",
  },
  "speaker-right": {
    icon: <PanelRight className="w-5 h-5" />,
    label: "Speaker right",
    next: "grid",
  },
};

const ControlsBar: React.FC<ControlsBarProps> = ({
  onLeave,
  onScreenShare,
  onStopScreenShare,
  onToggleMic,
  onToggleCamera,
  isHost,
  className,
  layout = "grid",
  onLayoutChange,
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

  const handleLayoutChange = () => {
    const next = layoutMeta[layout].next;
    onLayoutChange?.(next);
  };

  const currentMeta = layoutMeta[layout];

  return (
    <div
      className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
        {/* Mic */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleMic}
              size="icon-lg"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isMuted
                  ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
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
            {isMuted ? "Unmute" : "Mute"}
          </TooltipContent>
        </Tooltip>

        {/* Camera */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleCamera}
              size="icon-lg"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isCameraOff
                  ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
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
            {isCameraOff ? "Turn on camera" : "Turn off camera"}
          </TooltipContent>
        </Tooltip>

        {/* Screen share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleScreenShare}
              size="icon-lg"
              className={cn(
                "rounded-xl transition-all border-2 border-border",
                isScreenSharing
                  ? "bg-primary/80 hover:bg-primary text-primary-foreground"
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
            {isScreenSharing ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

        {/* Layout toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleLayoutChange}
              size="icon-lg"
              className="rounded-xl transition-all border-2 border-border bg-muted hover:bg-muted/80 text-foreground"
              aria-label={`Switch layout — current: ${currentMeta.label}`}
            >
              {currentMeta.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {currentMeta.label} — click to cycle
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Recording */}
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

        {/* Leave / End */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLeave}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 h-11"
            >
              <PhoneOff className="w-4 h-4 mr-1.5" />
              <span className="font-semibold">
                {isHost ? "End Meeting" : "Leave"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-destructive text-destructive-foreground border-none"
          >
            {isHost ? "End meeting for everyone" : "Leave meeting"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ControlsBar;
