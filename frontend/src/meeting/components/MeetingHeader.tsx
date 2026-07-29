import React from "react";
import { Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingHeaderProps {
  title?: string;
  meetingCode: string;
  participantCount?: number;
  isCopied?: boolean;
  onCopyCode?: () => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  title,
  meetingCode,
  participantCount = 1,
  isCopied,
  onCopyCode,
}) => {
  return (
    <header className="md:hidden w-full px-3 py-2 bg-background/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-40 shrink-0">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div className="flex flex-col min-w-0">
          <h1 className="text-white text-xs font-bold truncate max-w-[140px]">
            {title ?? "Meeting"}
          </h1>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <Users className="w-3 h-3 text-primary" />
            <span>
              {participantCount} {participantCount === 1 ? "User" : "Users"}
            </span>
          </div>
        </div>
      </div>

      {meetingCode && (
        <Button
          onClick={onCopyCode}
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-semibold gap-1.5 shrink-0"
        >
          <span>{meetingCode}</span>
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
      )}
    </header>
  );
};
