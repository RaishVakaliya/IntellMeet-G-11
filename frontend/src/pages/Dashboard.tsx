import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyMeetings,
  createMeeting,
  type MeetingData,
} from "../services/meetingService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Video,
  Plus,
  Users,
  Clock,
  Loader2,
  VideoOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0)
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (days === 1)
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");

  const {
    data: meetings = [],
    isLoading: meetingsLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-meetings"],
    queryFn: () => getMyMeetings(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      createMeeting(title, description),
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: ["my-meetings"] });
      toast.success("Meeting created successfully!");
      navigate(`/room/${meeting.meetingCode}`);
    },
    onError: (error) => toast.error(error.message || "Failed to create meeting"),
  });

  const handleCreateMeeting = () => {
    const title = meetingTitle.trim() || `${user?.username || "User"}'s Meeting`;
    createMutation.mutate({ title, description: meetingDescription.trim() || undefined });
  };

  if (meetingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Meetings",
      value: meetings.length,
      icon: Video,
      change: "+12%",
    },
    {
      label: "Participants",
      value: meetings.reduce((sum, m) => sum + (m.participants?.length || 0), 0),
      icon: Users,
      change: "+8%",
    },
    {
      label: "This Week",
      value: meetings.filter(
        (m) =>
          new Date(m.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      icon: Clock,
      change: "+5%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">{user?.username}!</span>{" "}
            Here's what's happening with your meetings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateMeeting} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Meeting
          </Button>
        </div>
      </div>

      {/* Quick Create */}
      <div className="bg-card border rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Meeting Title
              </label>
              <Input
                placeholder="E.g., Team sync, Client call"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Description (optional)
              </label>
              <Input
                placeholder="Brief description..."
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-1 lg:pt-0 lg:pl-6 lg:border-l lg:border-border">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate("/room/new")}
            >
              Quick Join
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={handleCreateMeeting}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Create & Join
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, change }) => (
          <div
            key={label}
            className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {change}
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Meetings */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Meetings</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/meetings")}>
            View All
          </Button>
        </div>
        <div className="divide-y divide-border">
          {meetings.slice(0, 5).map((meeting) => (
            <div key={meeting._id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{meeting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(meeting.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{meeting.participants?.length || 0} participants</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/room/${meeting.meetingCode}`)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {meetings.length === 0 && (
            <div className="text-center py-12">
              <VideoOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No meetings yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first meeting.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline">Browse templates</Button>
                <Button>Create Meeting</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;