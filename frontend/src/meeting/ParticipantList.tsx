import React from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import type { Participant } from "@/types/meeting";
import { useAuthStore } from "@/stores/authStore";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Users,
  Monitor,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ParticipantListProps {
  hostId?: string;
}

const ParticipantRow: React.FC<{
  p: Participant;
  isLocal?: boolean;
  isHost?: boolean;
}> = ({ p, isLocal, isHost }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
    <div className="relative">
      <Avatar className="w-9 h-9 border border-white/10">
        {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-zinc-800 text-white font-semibold text-xs">
          {p.name?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      {p.isActiveSpeaker && (
        <div className="absolute inset-0 rounded-full ring-2 ring-emerald-500 animate-pulse pointer-events-none" />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 overflow-hidden">
        <p className="text-sm text-slate-100 font-medium truncate">
          {p.name}
          {isLocal ? " (You)" : ""}
        </p>
        {isHost && (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-1 py-0 h-4 gap-0.5 pointer-events-none"
          >
            <Crown className="w-2.5 h-2.5 fill-current" />
            <span className="text-[10px] hidden lg:inline">Host</span>
          </Badge>
        )}
      </div>
      {p.isActiveSpeaker && (
        <p className="text-[10px] text-emerald-500 font-medium">Speaking</p>
      )}
    </div>

    <div className="flex items-center gap-1.5">
      {p.isMuted ? (
        <div className="p-1 rounded-full bg-red-500/10">
          <MicOff className="w-3 h-3 text-red-400" />
        </div>
      ) : (
        <div className="p-1 rounded-full bg-transparent">
          <Mic className="w-3 h-3 text-gray-500 group-hover:text-gray-400" />
        </div>
      )}
      {p.isScreenSharing && (
        <div className="p-1 rounded-full bg-emerald-500/10">
          <Monitor className="w-3 h-3 text-emerald-400" />
        </div>
      )}
      {p.isCameraOff ? (
        <div className="p-1 rounded-full bg-red-500/10">
          <VideoOff className="w-3 h-3 text-red-400" />
        </div>
      ) : (
        <div className="p-1 rounded-full">
          <Video className="w-3 h-3 text-gray-500 group-hover:text-gray-400" />
        </div>
      )}
    </div>
  </div>
);

const ParticipantList: React.FC<ParticipantListProps> = ({ hostId }) => {
  const { participants, isMuted, isCameraOff, isScreenSharing } =
    useMeetingStore();
  const { user } = useAuthStore();

  const localParticipant: Participant = {
    id: "local",
    dbUserId: user?._id,
    name: user?.username ?? "You",
    isMuted,
    isCameraOff,
    isScreenSharing,
    isActiveSpeaker: false,
  };

  const allParticipants = [localParticipant, ...participants].sort((a, b) => {
    if (a.dbUserId === hostId) return -1;
    if (b.dbUserId === hostId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900/40">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/5 shrink-0">
        <Users className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">
          Participants ({allParticipants.length})
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5">
        {allParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No participants yet</p>
          </div>
        ) : (
          allParticipants.map((p) => (
            <ParticipantRow
              key={p.id}
              p={p}
              isLocal={p.id === "local"}
              isHost={p.dbUserId === hostId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
