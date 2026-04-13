import { create } from "zustand";
import type { MeetingState } from "@/types/meeting";

export const useMeetingStore = create<MeetingState>((set) => ({
  meetingId: null,
  roomId: null,
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  isChatOpen: true,
  participants: [],
  messages: [],
  typingUsers: [],
  localStream: null,

  setMeeting: (id) => set({ meetingId: id, roomId: id }),

  setRoomId: (id) => set({ roomId: id }),

  setParticipants: (participants) => set({ participants }),

  addParticipant: (participant) =>
    set((s) => ({
      participants: s.participants.some((p) => p.id === participant.id)
        ? s.participants
        : [...s.participants, participant],
    })),

  removeParticipant: (id) =>
    set((s) => ({
      participants: s.participants.filter((p) => p.id !== id),
    })),

  toggleMic: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleCamera: () => set((s) => ({ isCameraOff: !s.isCameraOff })),

  toggleScreenShare: () =>
    set((s) => ({ isScreenSharing: !s.isScreenSharing })),

  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),

  sendMessage: (text: string, senderName: string, senderId?: string) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `m${Date.now()}`,
          senderId: senderId || "unknown",
          senderName,
          text,
          timestamp: new Date(),
        },
      ],
    })),

  setActiveSpeaker: (id) =>
    set((s) => ({
      participants: s.participants.map((p) => ({
        ...p,
        isActiveSpeaker: p.id === id,
      })),
    })),

  updateParticipantStream: (id, stream) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.id === id ? { ...p, stream } : p,
      ),
    })),

  updateParticipantMedia: (id, mediaState) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.id === id ? { ...p, ...mediaState } : p,
      ),
    })),

  setLocalStream: (stream) => set({ localStream: stream }),
  setTypingUser: (user) =>
    set((s) => ({
      typingUsers: s.typingUsers.some((u) => u.id === user.id)
        ? s.typingUsers
        : [...s.typingUsers, user],
    })),
  removeTypingUser: (id) =>
    set((s) => ({
      typingUsers: s.typingUsers.filter((u) => u.id !== id),
    })),

  leaveMeeting: () =>
    set({
      meetingId: null,
      roomId: null,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      participants: [],
      messages: [],
      typingUsers: [],
      localStream: null,
    }),

  leaveRoom: () =>
    set({
      roomId: null,
      meetingId: null,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      participants: [],
      messages: [],
      typingUsers: [],
      localStream: null,
    }),
}));
