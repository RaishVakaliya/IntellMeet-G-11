import { apiFetch, handleJsonResponse } from "@/lib/apiFetch";

export type MeetingParticipantRecord = {
  user: string | { _id: string; name: string; email: string; avatar?: string };
  role: string;
  leftAt?: string | null;
};

export interface MeetingActionItem {
  _id: string;
  text: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  completed: boolean;
}

export interface MeetingData {
  _id: string;
  title: string;
  meetingCode: string;
  status: "scheduled" | "ongoing" | "ended";
  createdAt: string;
  endTime?: string;
  recordingUrl?: string;
  summary?: string;
  actionItems?: MeetingActionItem[];
  createdBy?: { _id: string; name: string; email: string };
  participants: MeetingParticipantRecord[];
}

export type MeetingDetails = MeetingData;

export const createMeeting = async (title: string): Promise<MeetingData> => {
  const res = await apiFetch("/api/meetings/create", {
    method: "POST",
    body: JSON.stringify({ title, startTime: new Date() }),
  });
  return handleJsonResponse<MeetingData>(res);
};

export const joinMeeting = async (
  meetingCode: string,
): Promise<MeetingData> => {
  const res = await apiFetch("/api/meetings/join", {
    method: "POST",
    body: JSON.stringify({ meetingCode }),
  });
  return handleJsonResponse<MeetingData>(res);
};

export const getMyMeetings = async (): Promise<MeetingData[]> => {
  const res = await apiFetch("/api/meetings/my-meetings");
  return handleJsonResponse<MeetingData[]>(res);
};

export const getMeetingDetails = async (
  meetingCode: string,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${meetingCode}`);
  return handleJsonResponse<MeetingDetails>(res);
};

export const endMeeting = async (
  meetingCode: string,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${meetingCode}/end`, {
    method: "PATCH",
  });
  const data = await handleJsonResponse<{ meeting: MeetingDetails }>(res);
  return data.meeting;
};

export const uploadMeetingRecording = async (
  meetingCode: string,
  recording: Blob,
): Promise<{ recordingUrl: string; meeting: MeetingDetails }> => {
  const formData = new FormData();
  formData.append(
    "recording",
    recording,
    `meeting-recording-${Date.now()}.webm`,
  );

  const res = await apiFetch(`/api/meetings/${meetingCode}/recording`, {
    method: "POST",
    body: formData,
  });

  const data = await handleJsonResponse<{
    recordingUrl: string;
    meeting: MeetingDetails;
  }>(res);

  return {
    recordingUrl: data.recordingUrl,
    meeting: data.meeting,
  };
};

export const addActionItem = async (
  code: string,
  text: string,
  assignedTo?: string | null,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${code}/action-items`, {
    method: "POST",
    body: JSON.stringify({ text, assignedTo }),
  });
  return handleJsonResponse<MeetingDetails>(res);
};

export const toggleActionItem = async (
  code: string,
  itemId: string,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${code}/action-items/${itemId}`, {
    method: "PATCH",
  });
  return handleJsonResponse<MeetingDetails>(res);
};

export const deleteActionItem = async (
  code: string,
  itemId: string,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${code}/action-items/${itemId}`, {
    method: "DELETE",
  });
  return handleJsonResponse<MeetingDetails>(res);
};

export const updateMeetingSummary = async (
  code: string,
  summary: string,
): Promise<MeetingDetails> => {
  const res = await apiFetch(`/api/meetings/${code}/summary`, {
    method: "PATCH",
    body: JSON.stringify({ summary }),
  });
  return handleJsonResponse<MeetingDetails>(res);
};
