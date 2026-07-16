import React from "react";
import { Users, Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeetingInfoBoxProps {
  meetingTitle?: string;
  participantCount: number;
  meetingCode?: string;
  isCopied?: boolean;
  onCopyCode?: () => void;
}

export const MeetingInfoBox: React.FC<MeetingInfoBoxProps> = ({
  meetingTitle,
  participantCount,
  meetingCode,
  isCopied,
  onCopyCode,
}) => {
  return (
    <div className="hidden md:flex flex-1 items-center justify-start">
      <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl min-w-fit">
        <div className="flex flex-col">
          <p className="text-white text-sm font-bold truncate max-w-[120px] lg:max-w-[200px]">
            {meetingTitle ?? "Meeting"}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <Users className="w-3 h-3" />
            <span>
              {participantCount} {participantCount === 1 ? "User" : "Users"}
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-8 bg-white/10" />

        {meetingCode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCopyCode}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  {meetingCode}
                </span>
                {isCopied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Copy code</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
