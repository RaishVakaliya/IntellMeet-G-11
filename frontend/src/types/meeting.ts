export type Participant = {
  id: string;
  dbUserId?: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isActiveSpeaker: boolean;
  stream?: MediaStream;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
};

export type MeetingState = {
  meetingId: string | null;
  roomId: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  participants: Participant[];
  messages: ChatMessage[];
  typingUsers: { id: string; name: string }[];
  localStream: MediaStream | null;

  //Actions
  setMeeting: (id: string) => void;
  setRoomId: (id: string) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  toggleChat: () => void;
  sendMessage: (text: string, senderName: string, senderId?: string) => void;
  setActiveSpeaker: (id: string) => void;
  updateParticipantStream: (id: string, stream: MediaStream) => void;
  updateParticipantMedia: (
    id: string,
    mediaState: {
      isMuted?: boolean;
      isCameraOff?: boolean;
      isScreenSharing?: boolean;
    },
  ) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setTypingUser: (user: { id: string; name: string }) => void;
  removeTypingUser: (id: string) => void;
  leaveMeeting: () => void;
  leaveRoom: () => void;
};
