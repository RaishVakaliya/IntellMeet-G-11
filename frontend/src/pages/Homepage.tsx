import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeeting,
  getMyMeetings,
  joinMeeting,
  type MeetingData,
} from "../services/meetingService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import {
  Video,
  Plus,
  Link2,
  Copy,
  ChevronDown,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  Loader2,
  VideoOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { AppNavbar } from "../layouts/AppNavbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

<<<<<<< HEAD
const statusConfig = {
  ongoing: {
    label: "Live",
    class: "border-emerald-200 text-emerald-700 bg-emerald-50",
    dot: "bg-emerald-400",
  },
  scheduled: {
    label: "Scheduled",
    class: "border-amber-200 text-amber-700 bg-amber-50",
    dot: "bg-amber-400",
  },
  ended: {
    label: "Ended",
    class: "border-slate-200 text-slate-500 bg-transparent",
    dot: "bg-slate-400",
=======
const formatDuration = (start: string, end?: string) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
};

const statusConfig = {
  ongoing: {
    label: "Live",
    class:
      "border-primary/50 text-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] font-bold animate-[pulse_3s_infinite]",
    dot: "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]",
  },
  scheduled: {
    label: "Scheduled",
    class:
      "border-primary/50 text-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] font-bold",
    dot: "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]",
  },
  ended: {
    label: "Ended",
    class: "border-muted text-muted-foreground bg-transparent font-bold",
    dot: "bg-muted",
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
  },
} as const;

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [joinCode, setJoinCode] = useState("");
<<<<<<< HEAD
  const [isJoining, setIsJoining] = useState(false);
=======
  const [joiningCode, setJoiningCode] = useState<string | null>(null);
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
  const [createdMeeting, setCreatedMeeting] = useState<MeetingData | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const joinInputRef = useRef<HTMLInputElement>(null);

  const {
    data: meetings = [],
    isLoading: meetingsLoading,
    isFetching,
    refetch,
  } = useQuery<MeetingData[]>({
    queryKey: ["my-meetings"],
    queryFn: () => getMyMeetings(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const socket = useSocket();

  // Listen for real-time updates from the server
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      console.log("[Lobby] Meetings list updated, refetching...");
      qc.invalidateQueries({ queryKey: ["my-meetings"] });
    };

    socket.on("meetings-updated", handleUpdate);
    return () => {
      socket.off("meetings-updated", handleUpdate);
    };
  }, [socket, qc]);

  const createMutation = useMutation({
    mutationFn: ({
      title,
      description,
    }: {
      title: string;
      description?: string;
      instant: boolean;
    }) => createMeeting(title, description),
    onSuccess: (meeting, { instant }) => {
      qc.invalidateQueries({ queryKey: ["my-meetings"] });
<<<<<<< HEAD
=======
      toast.success("Meeting created successfully");
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
      if (instant) {
        navigate(`/room/${meeting.meetingCode}`);
      } else {
        setCreatedMeeting(meeting);
        setDialogOpen(true);
      }
    },
    onError: (e: Error) => toast.error(e.message || "Could not create meeting"),
  });

  const handleCreateMeeting = (instant = false) => {
    const title =
      meetingTitle.trim() ||
      (user ? `${user.username}'s Meeting` : "Instant Meeting");
    const description = meetingDescription.trim() || undefined;
    createMutation.mutate({ title, description, instant });
  };

  const handleJoinMeeting = async (
    codeOverride?: string | React.MouseEvent,
  ) => {
<<<<<<< HEAD
    const code = (
      typeof codeOverride === "string" ? codeOverride : joinCode
    ).trim();
    if (!code) {
      toast.error("Enter a meeting code");
      joinInputRef.current?.focus();
      return;
    }
    setIsJoining(true);
=======
    let code = (
      typeof codeOverride === "string" ? codeOverride : joinCode
    ).trim();

    if (!code) {
      toast.error("Enter a meeting code or link");
      joinInputRef.current?.focus();
      return;
    }

    if (code.includes("/room/")) {
      try {
        const url = new URL(code);
        const pathParts = url.pathname.split("/");
        const codeFromPath = pathParts[pathParts.length - 1];
        if (codeFromPath) {
          code = codeFromPath;
        }
      } catch (e) {
        const parts = code.split("/room/");
        code = parts[parts.length - 1].split(/[?#]/)[0];
      }
    }

    setJoiningCode(code);
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

    try {
      await joinMeeting(code);
      navigate(`/room/${code}`);
    } catch (e: any) {
<<<<<<< HEAD
      setIsJoining(false);
=======
      setJoiningCode(null);
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
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

  if (!user) return null;

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white">
=======
    <div className="min-h-screen bg-background">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, <span className="text-teal-600">{user.username}</span>{" "}
            👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
=======
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="text-muted-foreground">{user.username}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            Start or join a secure video meeting
          </p>
        </div>

<<<<<<< HEAD
        <section className="bg-slate-50/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200/60 bg-white/40">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
=======
        <section className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-card/40">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              Prepare Meeting
            </h2>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
<<<<<<< HEAD
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
=======
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                  Meeting Title
                </label>
                <Input
                  placeholder={`Enter title (Default: ${user.username}'s Meeting)`}
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
<<<<<<< HEAD
                  className="h-11 bg-white border-slate-200 text-sm focus:ring-teal-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
=======
                  className="h-11 bg-background border-border text-sm rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                  Meeting Description
                </label>
                <Input
                  placeholder="What is this meeting about? (Optional)"
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
<<<<<<< HEAD
                  className="h-11 bg-white border-slate-200 text-sm focus:ring-teal-500/20 rounded-xl"
=======
                  className="h-11 bg-background border-border text-sm rounded-xl"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                />
              </div>
            </div>

            <Separator className="bg-slate-200/60" />

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              <div className="flex shrink-0 shadow-sm rounded-xl overflow-hidden">
                <Button
                  onClick={() => handleCreateMeeting(true)}
                  disabled={isCreating}
                  className="text-white rounded-r-none border-r h-10 px-4 gap-2 font-medium"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  New Meeting
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
                      onClick={() => handleCreateMeeting(false)}
                    >
<<<<<<< HEAD
                      <Link2 className="w-4 h-4 text-slate-400" />
=======
                      <Link2 className="w-4 h-4 text-muted-foreground" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                      Get a meeting link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => handleCreateMeeting(true)}
                    >
<<<<<<< HEAD
                      <Video className="w-4 h-4 text-slate-400" />
=======
                      <Video className="w-4 h-4 text-muted-foreground" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                      Start an instant meeting
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block"
              />

              <div className="flex flex-1 gap-2">
                <Input
                  ref={joinInputRef}
                  placeholder="Enter a code or link"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
<<<<<<< HEAD
                  className="h-10 bg-white border-slate-200 text-sm"
                />
                <Button
                  onClick={handleJoinMeeting}
                  disabled={!joinCode.trim() || isJoining}
                  variant="outline"
                  className="h-10 px-4 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100 gap-1"
                >
                  Join
                  <ArrowRight className="w-3.5 h-3.5" />
=======
                  className="h-10 bg-background border-border text-sm"
                />
                <Button
                  onClick={handleJoinMeeting}
                  disabled={!joinCode.trim() || !!joiningCode}
                  variant="outline"
                  className="h-10 px-4 shrink-0 border-border text-foreground hover:bg-muted gap-1"
                >
                  {joiningCode === joinCode.trim() ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Join
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div>
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-slate-800 text-base">
=======
            <h2 className="font-semibold text-foreground text-base">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              Your Meetings
            </h2>
            <div className="flex items-center gap-3">
              {meetings.length > 0 && (
<<<<<<< HEAD
                <span className="text-xs text-slate-400">
=======
                <span className="text-xs text-muted-foreground">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                  {meetings.length} total
                </span>
              )}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
<<<<<<< HEAD
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
=======
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                title="Refresh meetings"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>
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
<<<<<<< HEAD
                <VideoOff className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No meetings yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
=======
                <VideoOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No meetings yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                Create one above to get started
              </p>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {meetings.slice(0, 8).map((m) => {
                const cfg =
                  statusConfig[m.status as keyof typeof statusConfig] ??
                  statusConfig.ended;
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

                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(m.meetingCode)}
                        disabled={m.status === "ended" || isJoining}
                        className={`h-7 px-3 text-xs text-white ${
                          m.status === "ended"
                            ? "bg-slate-300 cursor-not-allowed"
                            : m.status === "ongoing"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-teal-600 hover:bg-teal-700"
                        }`}
                      >
                        {isJoining ? (
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
=======
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
                  const isHost = m.createdBy?._id === user?._id;
                  const duration =
                    m.status === "ended"
                      ? formatDuration(m.createdAt, m.endTime)
                      : null;
                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
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

                        <Button
                          size="sm"
                          onClick={() => handleJoinMeeting(m.meetingCode)}
                          disabled={m.status === "ended" || !!joiningCode}
                          className={`h-7 px-3 text-xs ${
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
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            </div>
          )}
        </div>

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
<<<<<<< HEAD
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
=======
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2`}
              >
                <Icon className={`w-4 h-4 text-primary`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
            </div>
          ))}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
<<<<<<< HEAD
                <Link2 className="w-3.5 h-3.5 text-teal-600" />
=======
                <Link2 className="w-3.5 h-3.5 text-primary" />
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
              </div>
              Meeting link is ready
            </DialogTitle>
          </DialogHeader>
          {createdMeeting && (
            <div className="space-y-4 pt-1">
<<<<<<< HEAD
              <p className="text-sm text-slate-500">
                Share this code with people you want to meet with.
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="font-mono text-base font-semibold text-slate-800 tracking-widest">
=======
              <p className="text-sm text-muted-foreground">
                Share this code with people you want to meet with.
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="font-mono text-base font-semibold text-foreground tracking-widest">
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                  {createdMeeting.meetingCode}
                </span>
                <button
                  onClick={() => copyCode(createdMeeting.meetingCode)}
<<<<<<< HEAD
                  className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
=======
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 font-medium transition-colors"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
<<<<<<< HEAD
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
=======
                  className="flex-1 border-border text-foreground hover:bg-muted"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
<<<<<<< HEAD
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
=======
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a
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

export default Homepage;
