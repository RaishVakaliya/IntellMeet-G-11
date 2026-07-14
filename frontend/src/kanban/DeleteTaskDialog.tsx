import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
            Delete Task
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this task? This cannot be undone.
        </p>
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-border rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
