import React from "react";
import { Loader2 } from "lucide-react";

export const MeetingLoading: React.FC = () => {
  return (
    <div className="h-screen dark bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm">Joining meeting...</p>
      </div>
    </div>
  );
};
