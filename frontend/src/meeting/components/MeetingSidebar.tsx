import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatPanel from "@/meeting/ChatPanel";
import TranscriptionPanel from "@/meeting/TranscriptionPanel";
import ParticipantList from "@/meeting/ParticipantList";
import { MeetingSidebarTabs } from "./MeetingSidebarTabs";

interface MeetingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarTab: "chat" | "participants" | "captions";
  setSidebarTab: (tab: "chat" | "participants" | "captions") => void;
  participantsCount: number;
  socket: any;
  roomId: string;
  hostId?: string;
}

export const MeetingSidebar: React.FC<MeetingSidebarProps> = ({
  isOpen,
  onClose,
  sidebarTab,
  setSidebarTab,
  participantsCount,
  socket,
  roomId,
  hostId,
}) => {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-[60] lg:relative lg:inset-auto flex flex-col border-white/5 bg-background lg:bg-card/10 shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        isOpen
          ? "w-full lg:w-80 translate-x-0 opacity-100 border-l"
          : "w-full lg:w-0 translate-x-full lg:translate-x-0 opacity-0 lg:border-l-0 pointer-events-none",
      )}
    >
      <div className="w-full lg:w-80 h-full flex flex-col shrink-0 min-w-[100vw] lg:min-w-[20rem]">
        <div className="flex items-center border-b border-white/5 shrink-0">
          <MeetingSidebarTabs
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            participantsCount={participantsCount}
          />
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-3 border-l border-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {sidebarTab === "chat" ? (
            <ChatPanel socket={socket} meetingCode={roomId} />
          ) : sidebarTab === "captions" ? (
            <TranscriptionPanel />
          ) : (
            <ParticipantList hostId={hostId} />
          )}
        </div>
      </div>
    </div>
  );
};
