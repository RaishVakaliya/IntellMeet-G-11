import React from "react";
import {
  RefreshCw,
  VideoOff,
  Video,
  Users,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { MeetingData } from "../services/meetingService";
import { statusConfig, formatDate, formatDuration } from "./utils";

interface MeetingHistorySectionProps {
  meetings: MeetingData[];
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  onSelectMeeting: (code: string) => void;
  onJoin: (code: string) => void;
  joiningCode: string | null;
  currentUserId: string;
}

export const MeetingHistorySection: React.FC<MeetingHistorySectionProps> = ({
  meetings,
  isLoading,
  isFetching,
  onRefresh,
  onSelectMeeting,
  onJoin,
  joiningCode,
  currentUserId,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground text-base">
          Your Meetings
        </h2>
        <div className="flex items-center gap-3">
          {meetings.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {meetings.length} total
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh meetings"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-border rounded-2xl bg-muted/20">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
            <VideoOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No meetings yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create one above to get started
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[...meetings]
            .sort((a, b) => {
              const order = { ongoing: 0, scheduled: 1, ended: 2 };
              return (
                (order[a.status as keyof typeof order] ?? 3) -
                (order[b.status as keyof typeof order] ?? 3)
              );
            })
            .slice(0, 8)
            .map((m) => {
              const cfg =
                statusConfig[m.status as keyof typeof statusConfig] ??
                statusConfig.ended;
              const isHost = m.createdBy?._id === currentUserId;
              const duration =
                m.status === "ended"
                  ? formatDuration(m.createdAt, m.endTime)
                  : null;
              return (
                <div
                  key={m._id}
                  onClick={() => onSelectMeeting(m.meetingCode)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group/meeting"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover/meeting:text-primary transition-colors">
                        {m.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {m.meetingCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {m.participants.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(m.createdAt)}
                      </span>
                      {duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {duration}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs h-5 py-0 border-primary/20 ${
                          isHost
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-muted border-border"
                        }`}
                      >
                        {isHost ? "Host" : "Member"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs py-0 h-5 flex items-center gap-1 ${cfg.class}`}
                      >
                        {m.status === "ongoing" && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse inline-block`}
                          />
                        )}
                        {cfg.label}
                      </Badge>
                    </div>

                    {m.recordingUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(m.recordingUrl, "_blank");
                        }}
                        className="h-7 px-3 text-xs border-primary/20 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Recording
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(m.meetingCode);
                      }}
                      disabled={m.status === "ended" || !!joiningCode}
                      className={`h-7 px-3 text-xs cursor-pointer ${
                        m.status === "ended"
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {joiningCode === m.meetingCode ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : m.status === "ended" ? (
                        "Ended"
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
    </div>
  );
};
