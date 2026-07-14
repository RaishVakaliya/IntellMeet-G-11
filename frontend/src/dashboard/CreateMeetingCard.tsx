import React, { useState } from "react";
import { Plus, Video, Link2, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface CreateMeetingCardProps {
  onCreate: (title: string, instant: boolean) => void;
  isCreating: boolean;
  username: string;
}

export const CreateMeetingCard: React.FC<CreateMeetingCardProps> = ({
  onCreate,
  isCreating,
  username,
}) => {
  const [meetingTitle, setMeetingTitle] = useState("");

  const handleCreate = (instant: boolean) => {
    const title = meetingTitle.trim() || `${username}'s Meeting`;
    onCreate(title, instant);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-5 hover:border-primary/30 transition-all shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Create Meeting</p>
          <p className="text-xs text-muted-foreground">
            Start a new room instantly
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Meeting Title (Optional)"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="h-10 text-xs bg-background border-border rounded-xl"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => handleCreate(true)}
            disabled={isCreating}
            className="flex-1 h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Video className="w-4 h-4" /> Start Now
              </>
            )}
          </Button>
          <Button
            onClick={() => handleCreate(false)}
            disabled={isCreating}
            variant="outline"
            className="flex-1 h-11 text-sm font-bold border-border gap-2 rounded-xl hover:bg-muted"
          >
            <Link2 className="w-4 h-4" /> Get Link
          </Button>
        </div>
      </div>
    </div>
  );
};
