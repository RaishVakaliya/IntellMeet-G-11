import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMeeting,
  getMyMeetings,
  joinMeeting,
  type MeetingData,
} from "@/services/meetingService";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { useMeetingStore } from "@/stores/meetingStore";
import { AppNavbar } from "@/layouts/AppNavbar";
import {
  Video,
  Plus,
  Link2,
  Copy,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  Loader2,
  VideoOff,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const MeetingLobby: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setMeeting } = useMeetingStore();
  const qc = useQueryClient();

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingData | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery<
    MeetingData[]
  >({
    queryKey: ["my-meetings"],
    queryFn: () => getMyMeetings(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const socket = useSocket();

  // Listen for real-time updates from server
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      qc.invalidateQueries({ queryKey: ["my-meetings"] });
    };
    socket.on("meetings-updated", handleUpdate);
    return () => {
      socket.off("meetings-updated", handleUpdate);
    };
  }, [socket, qc]);

  const createMutation = useMutation({
    mutationFn: ({ title }: { title: string; instant: boolean }) =>
      createMeeting(title),
    onSuccess: (meeting, variables) => {
      qc.invalidateQueries({ queryKey: ["my-meetings"] });
      setMeeting(meeting.meetingCode);
      if (variables.instant) {
        navigate(`/room/${meeting.meetingCode}`);
      } else {
        setCreatedMeeting(meeting);
        setDialogOpen(true);
      }
    },
    onError: (e: any) => {
      if (e.activeCode) {
        toast.error(`You already have an active meeting: ${e.activeCode}`, {
          duration: 5000,
          action: {
            label: "Copy Code",
            onClick: () => {
              navigator.clipboard.writeText(e.activeCode);
              toast.success("Code copied!");
            },
          },
        });
      } else {
        toast.error(e.message || "Could not create meeting");
      }
    },
  });

  const handleCreate = (instant: boolean) => {
    const title =
      meetingTitle.trim() ||
      (user ? `${user.username}'s Meeting` : "Instant Meeting");
    createMutation.mutate({ title, instant });
  };

  const handleJoin = async (codeOverride?: string | React.MouseEvent) => {
    const code = (
      typeof codeOverride === "string" ? codeOverride : joinCode
    ).trim();
    if (!code) {
      toast.error("Enter a meeting code");
      return;
    }
    setIsJoining(true);

    try {
      await joinMeeting(code);
      navigate(`/room/${code}`);
    } catch (e: any) {
      setIsJoining(false);
      if (e.activeCode) {
        toast.error(e.message, {
          action: {
            label: "Copy Own Code",
            onClick: () => {
              navigator.clipboard.writeText(e.activeCode);
              toast.success("Code copied!");
            },
          },
        });
      } else {
        toast.error(e.message || "Failed to join meeting");
      }
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCreating = createMutation.isPending;

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back,{" "}
            <span className="text-teal-600">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Start or join a secure video meeting
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex shrink-0">
            <Button
              onClick={() => handleCreate(true)}
              disabled={isCreating}
              className="text-white rounded-r-none border-r h-10 px-4 gap-2 font-medium"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New meeting
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isCreating}
                  className="text-white rounded-l-none h-10 px-2.5"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleCreate(false)}
                >
                  <Link2 className="w-4 h-4 text-slate-400" />
                  Get a meeting link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleCreate(true)}
                >
                  <Video className="w-4 h-4 text-slate-400" />
                  Start an instant meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-8 hidden sm:block" />

          {/* Join */}
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Enter a code or link"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="h-10 bg-white border-slate-200 text-sm"
            />
            <Button
              onClick={handleJoin}
              disabled={!joinCode.trim() || isJoining}
              variant="outline"
              className="h-10 px-4 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 gap-1"
            >
              Join
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Create with custom title */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-violet-50 rounded-xl border border-teal-100">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <Input
            placeholder="Meeting title (optional)"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            className="h-9 bg-white border-teal-200 text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleCreate(true)}
            disabled={isCreating}
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isCreating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Start"
            )}
          </Button>
        </div>

        {/* Meetings list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-base">
              Your Meetings
            </h2>
            {meetings.length > 0 && (
              <span className="text-xs text-slate-400">
                {meetings.length} total
              </span>
            )}
          </div>

          {meetingsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <VideoOff className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No meetings yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Create one above to get started
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {meetings.slice(0, 8).map((m) => {
                const isHost = m.participants.some((p) => p.role === "host");
                return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {m.title}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {m.meetingCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {m.participants.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(m.createdAt)}
                        </span>
                        {isHost && (
                          <Badge
                            variant="outline"
                            className="text-xs border-teal-200 text-teal-700 bg-teal-50 py-0 h-5"
                          >
                            Host
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs py-0 h-5 ${
                            m.status === "ongoing"
                              ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                              : m.status === "ended"
                                ? "border-slate-200 text-slate-500"
                                : "border-amber-200 text-amber-700 bg-amber-50"
                          }`}
                        >
                          {m.status}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleJoin(m.meetingCode)}
                        disabled={m.status === "ended" || isJoining}
                        className="h-7 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        {isJoining ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : m.status === "ended" ? (
                          "View"
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Meetings",
              value: meetings.length,
              icon: Video,
              color: "teal",
            },
            {
              label: "Participants",
              value: meetings.reduce((s, m) => s + m.participants.length, 0),
              icon: Users,
              color: "violet",
            },
            {
              label: "This week",
              value: meetings.filter((m) => {
                const d = new Date(m.createdAt);
                return Date.now() - d.getTime() < 7 * 86400000;
              }).length,
              icon: Clock,
              color: "amber",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center mb-2`}
              >
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Meeting created dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <Link2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              Meeting link is ready
            </DialogTitle>
          </DialogHeader>
          {createdMeeting && (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-slate-500">
                Share this code with people you want to meet with.
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="font-mono text-base font-semibold text-slate-800 tracking-widest">
                  {createdMeeting.meetingCode}
                </span>
                <button
                  onClick={() => copyCode(createdMeeting.meetingCode)}
                  className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                  onClick={() => {
                    setDialogOpen(false);
                    navigate(`/room/${createdMeeting.meetingCode}`);
                  }}
                >
                  <Video className="w-4 h-4" /> Start now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingLobby;
