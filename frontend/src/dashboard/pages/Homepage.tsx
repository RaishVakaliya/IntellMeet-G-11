import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeeting,
  getMyMeetings,
  joinMeeting,
  type MeetingData,
} from "../../services/meetingService";
import { getMyBoards, type Board } from "../../services/boardService";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { AppNavbar } from "../../layouts/AppNavbar";
import { useDocumentSEO } from "../../hooks/useDocumentSEO";

import { DashboardHeader } from "../../dashboard/DashboardHeader";
import { QuickJoinCard } from "../../dashboard/QuickJoinCard";
import { CreateMeetingCard } from "../../dashboard/CreateMeetingCard";
import { MeetingRoomsSection } from "../../dashboard/MeetingRoomsSection";
import { MeetingHistorySection } from "../../dashboard/MeetingHistorySection";
import { DashboardStats } from "../../dashboard/DashboardStats";
import { CreateMeetingDialog } from "../../dashboard/CreateMeetingDialog";
import { MeetingInsightsDialog } from "../../dashboard/MeetingInsightsDialog";

const Homepage = () => {
  useDocumentSEO({
    title: "User Dashboard",
    description:
      "Manage your meetings, create meeting links, track action items, and access collaborative workspaces.",
  });

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingData | null>(
    null,
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMeetingCode, setSelectedMeetingCode] = useState<string | null>(
    null,
  );

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: ["my-boards"],
    queryFn: getMyBoards,
    enabled: !!user,
    staleTime: 30_000,
  });

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
    onSuccess: (meeting, { instant }) => {
      qc.invalidateQueries({ queryKey: ["my-meetings"] });
      toast.success("Meeting created successfully");
      if (instant) {
        navigate(`/room/${meeting.meetingCode}`);
      } else {
        setCreatedMeeting(meeting);
        setCreateDialogOpen(true);
      }
    },
    onError: (e: Error) => toast.error(e.message || "Could not create meeting"),
  });

  const handleCreateMeeting = (title: string, instant: boolean) => {
    createMutation.mutate({ title, instant });
  };

  const joinMutation = useMutation({
    mutationFn: joinMeeting,
    onSuccess: (_, code) => {
      navigate(`/room/${code}`);
    },
    onError: (error: Error & { activeCode?: string }) => {
      setJoiningCode(null);
      if (error.activeCode) {
        toast.error(error.message, {
          action: {
            label: "Copy Own Code",
            onClick: () => {
              navigator.clipboard.writeText(error.activeCode!);
              toast.success("Code copied!");
            },
          },
        });
      } else {
        toast.error(error.message || "Failed to join meeting");
      }
    },
  });

  const handleJoinMeeting = (code: string) => {
    let sanitizedCode = code.trim();

    if (sanitizedCode.includes("/room/")) {
      try {
        const url = new URL(sanitizedCode);
        const parts = url.pathname.split("/");
        sanitizedCode = parts[parts.length - 1] || sanitizedCode;
      } catch {
        sanitizedCode =
          sanitizedCode.split("/room/").pop()?.split(/[?#]/)[0] ??
          sanitizedCode;
      }
    }

    setJoiningCode(sanitizedCode);
    joinMutation.mutate(sanitizedCode);
  };

  const activeRooms = meetings.filter((m) => m.status !== "ended");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main
        id="main-content"
        aria-label="Dashboard"
        className="max-w-5xl mx-auto px-6 pt-12 pb-24 sm:py-12 space-y-10"
      >
        <DashboardHeader username={user.username} />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <QuickJoinCard onJoin={handleJoinMeeting} joiningCode={joiningCode} />
          <CreateMeetingCard
            onCreate={handleCreateMeeting}
            isCreating={createMutation.isPending}
            username={user.username}
          />
        </section>

        <MeetingRoomsSection
          rooms={activeRooms}
          isLoading={meetingsLoading}
          onJoin={handleJoinMeeting}
          joiningCode={joiningCode}
          currentUserId={user._id}
        />

        <MeetingHistorySection
          meetings={meetings}
          isLoading={meetingsLoading}
          isFetching={isFetching}
          onRefresh={refetch}
          onSelectMeeting={(code) => setSelectedMeetingCode(code)}
          onJoin={handleJoinMeeting}
          joiningCode={joiningCode}
          currentUserId={user._id}
        />

        <DashboardStats meetings={meetings} />
      </main>

      <CreateMeetingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        meeting={createdMeeting}
        onStart={() => {
          if (createdMeeting) {
            navigate(`/room/${createdMeeting.meetingCode}`);
          }
        }}
      />

      <MeetingInsightsDialog
        open={!!selectedMeetingCode}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMeetingCode(null);
          }
        }}
        meetingCode={selectedMeetingCode}
        boards={boards}
        currentUserId={user._id}
      />
    </div>
  );
};

export default Homepage;
