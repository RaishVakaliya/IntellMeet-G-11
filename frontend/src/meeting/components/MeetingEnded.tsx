import React from "react";
import { VideoOff } from "lucide-react";

interface MeetingEndedProps {
  onBack: () => void;
}

export const MeetingEnded: React.FC<MeetingEndedProps> = ({ onBack }) => {
  return (
    <div className="h-screen dark bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <VideoOff className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-white font-semibold text-lg">Meeting has ended</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground text-sm transition-colors cursor-pointer"
        >
          Go back to dashboard
        </button>
      </div>
    </div>
  );
};
