import React from "react";
import { Video, Users, Clock } from "lucide-react";
import type { MeetingData } from "../services/meetingService";

interface DashboardStatsProps {
  meetings: MeetingData[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ meetings }) => {
  const stats = [
    { label: "Meetings", value: meetings.length, icon: Video },
    {
      label: "Participants",
      value: meetings.reduce((s, m) => s + m.participants.length, 0),
      icon: Users,
    },
    {
      label: "This week",
      value: meetings.filter(
        (m) => Date.now() - new Date(m.createdAt).getTime() < 7 * 86400000,
      ).length,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};
