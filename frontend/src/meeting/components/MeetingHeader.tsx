import React from "react";

interface MeetingHeaderProps {
  title?: string;
  meetingCode: string;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = () => {
  // Return null because ControlsBar handles the header information display natively,
  // preventing double title render.
  return null;
};
