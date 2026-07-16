import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMeetingStore } from "@/stores/meetingStore";
import { endMeeting, joinMeeting } from "@/services/meetingService";
import type { Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";

export const useMeetingLifecycle = (
  roomId: string | undefined,
  socket: Socket,
  queryClient: QueryClient,
  isHost: boolean,
) => {
  const navigate = useNavigate();
  const leaveMeeting = useMeetingStore((s) => s.leaveMeeting);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasHandledMeetingEnd = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    joinMeeting(roomId)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["meeting-details", roomId],
        });
      })
      .catch(() => {});
  }, [roomId, queryClient]);

  useEffect(() => {
    const handleMeetingEnded = () => {
      if (hasHandledMeetingEnd.current) return;
      hasHandledMeetingEnd.current = true;
      toast.info("Meeting ended by host");
      leaveMeeting();
      navigate("/dashboard");
    };

    socket.on("meeting-ended", handleMeetingEnded);
    return () => {
      socket.off("meeting-ended", handleMeetingEnded);
    };
  }, [socket, leaveMeeting, navigate]);

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    if (isHost && roomId) {
      try {
        await endMeeting(roomId);
        toast.success("Meeting ended for everyone");
      } catch (err) {
        console.warn("[MeetingRoom] Failed to end meeting on leave:", err);
      }
    }
    leaveMeeting();
    navigate("/dashboard");
  };

  return {
    isLeaving,
    hasHandledMeetingEnd,
    handleLeave,
  };
};
