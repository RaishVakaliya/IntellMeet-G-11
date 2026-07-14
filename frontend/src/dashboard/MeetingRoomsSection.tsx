import React, { useState } from "react";
import {
  LayoutGrid,
  ChevronDown,
  VideoOff,
  Users,
  Loader2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import type { MeetingData } from "../services/meetingService";
import { statusConfig } from "./utils";

interface MeetingRoomsSectionProps {
  rooms: MeetingData[];
  isLoading: boolean;
  onJoin: (code: string) => void;
  joiningCode: string | null;
  currentUserId: string;
}

export const MeetingRoomsSection: React.FC<MeetingRoomsSectionProps> = ({
  rooms,
  isLoading,
  onJoin,
  joiningCode,
  currentUserId,
}) => {
  const [roomsExpanded, setRoomsExpanded] = useState(true);

  return (
    <section className="space-y-3">
      <button
        className="w-full flex items-center justify-between cursor-pointer"
        onClick={() => setRoomsExpanded((v) => !v)}
      >
        <h2 className="font-semibold text-foreground text-base flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          Meeting Rooms
          <Badge
            variant="outline"
            className="text-xs border-primary/20 text-primary bg-primary/5 font-mono ml-1"
          >
            {rooms.length} active
          </Badge>
        </h2>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            roomsExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {roomsExpanded && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-muted/20">
              <VideoOff className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                No active rooms
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a meeting above to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.slice(0, 6).map((m) => {
                const isHost = m.createdBy?._id === currentUserId;
                const cfg =
                  statusConfig[m.status as keyof typeof statusConfig] ??
                  statusConfig.scheduled;
                return (
                  <div
                    key={m._id}
                    className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {m.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {m.meetingCode}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs py-0 h-5 shrink-0 flex items-center gap-1 ${cfg.class}`}
                      >
                        {m.status === "ongoing" && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse inline-block`}
                          />
                        )}
                        {cfg.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {m.participants.length}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs h-5 py-0 ${
                            isHost
                              ? "text-primary bg-primary/10 border-primary/20"
                              : "text-muted-foreground bg-muted border-border"
                          }`}
                        >
                          {isHost ? "Host" : "Member"}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onJoin(m.meetingCode)}
                        disabled={!!joiningCode}
                        className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      >
                        {joiningCode === m.meetingCode ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : m.status === "ongoing" ? (
                          "Join Live"
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};
