import { nanoid } from "nanoid";

let mockMeetings = [];
let meetingIdCounter = 1;

export const getMockMeetings = () => mockMeetings;

export const findUserActiveMeeting = async (userId) => {
  return mockMeetings.find(m => m.createdBy === userId && m.status !== 'ended');
};

export const createMeetingMock = async (data) => {
  const meetingCode = nanoid(10);
  const meeting = {
    _id: `mock_meeting_${meetingIdCounter++}`,
    ...data,
    meetingCode,
    participants: data.participants || [],
    status: data.status || 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockMeetings.push(meeting);
  return meeting;
};

export const findMeetingByCode = async (meetingCode) => {
  return mockMeetings.find(m => m.meetingCode === meetingCode);
};

export const updateMeeting = async (meetingCode, updates) => {
  const index = mockMeetings.findIndex(m => m.meetingCode === meetingCode);
  if (index === -1) return null;
  mockMeetings[index] = { ...mockMeetings[index], ...updates, updatedAt: new Date().toISOString() };
  return mockMeetings[index];
};

export const findUserMeetings = async (userId) => {
  return mockMeetings.filter(m => m.createdBy === userId || m.participants.some(p => p.user === userId));
};

export const clearMockData = () => {
  mockMeetings = [];
  meetingIdCounter = 1;
};

// Populate some demo data
mockMeetings = [
  {
    _id: 'demo1',
    title: 'Demo Team Sync',
    meetingCode: 'DEMO123ABC',
    status: 'ended',
    createdBy: 'mock_1',
    participants: [{user: 'mock_1', role: 'host'}],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

