import React, { useState } from "react";
import { Link2, Copy, Video } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import type { MeetingData } from "../services/meetingService";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: MeetingData | null;
  onStart: () => void;
}

export const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({
  open,
  onOpenChange,
  meeting,
  onStart,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-primary" />
            </div>
            Meeting link is ready
          </DialogTitle>
        </DialogHeader>
        {meeting && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Share this code with people you want to meet with.
            </p>
            <div className="flex items-center justify-between bg-muted/50 border border-border rounded-xl px-4 py-3">
              <span className="font-mono text-base font-semibold text-foreground tracking-widest">
                {meeting.meetingCode}
              </span>
              <button
                onClick={() => handleCopyCode(meeting.meetingCode)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 font-medium transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={() => {
                  onOpenChange(false);
                  onStart();
                }}
              >
                <Video className="w-4 h-4" /> Start now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
