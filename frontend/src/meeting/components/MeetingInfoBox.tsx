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
    <div className="hidden md:flex flex-1 items-center justify-start min-w-0 mr-2">
      <div className="flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-card/60 sm:bg-card/40 backdrop-blur-2xl border border-white/10 shadow-2xl min-w-fit">
        <div className="hidden sm:flex flex-col">
          <p className="text-white text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]">
            {meetingTitle ?? "Meeting"}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <Users className="w-3 h-3" />
            <span>
              {participantCount} {participantCount === 1 ? "User" : "Users"}
            </span>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="hidden sm:block h-6 sm:h-8 bg-white/10"
        />

        {meetingCode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCopyCode}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors group bg-white/5 sm:bg-transparent"
                aria-label={`Copy meeting code: ${meetingCode}`}
              >
                <span className="font-mono text-xs text-foreground sm:text-muted-foreground sm:group-hover:text-foreground font-semibold">
                  {meetingCode}
                </span>
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
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
