import React, { useState, useEffect } from "react";
import { Layers, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";

interface ConvertTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { text: string; assignedTo: string | null; itemId: string } | null;
  boards: any[];
  participants?: any[];
  currentUserId: string;
  onCreateTask: (boardId: string, data: any) => void;
  isCreating: boolean;
}

export const ConvertTaskDialog: React.FC<ConvertTaskDialogProps> = ({
  open,
  onOpenChange,
  item,
  boards,
  participants = [],
  currentUserId,
  onCreateTask,
  isCreating,
}) => {
  const navigate = useNavigate();
  const [targetBoardId, setTargetBoardId] = useState("");
  const [targetColumnId, setTargetColumnId] = useState("");
  const [targetPriority, setTargetPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [conversionAssignee, setConversionAssignee] = useState("");

  const targetBoard = boards.find((b) => b._id === targetBoardId);
  const targetColumns = targetBoard?.columns || [];

  useEffect(() => {
    if (boards.length > 0 && !targetBoardId) {
      setTargetBoardId(boards[0]._id);
    }
  }, [boards, targetBoardId]);

  useEffect(() => {
    if (targetColumns.length > 0) {
      setTargetColumnId(targetColumns[0].id);
    } else {
      setTargetColumnId("");
    }
  }, [targetBoardId, targetColumns]);

  useEffect(() => {
    if (item) {
      setConversionAssignee(item.assignedTo || "");
    }
  }, [item]);

  const handleCreateTask = () => {
    if (!item || !targetBoardId || !targetColumnId) return;
    onCreateTask(targetBoardId, {
      title: item.text.trim(),
      description: `Created from meeting action item.`,
      priority: targetPriority,
      column: targetColumnId,
      assignedTo: conversionAssignee || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px] p-6 border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            Convert to Kanban Task
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 bg-muted/20 border border-border/50 rounded-2xl p-4 text-sm">
              <p className="text-xs text-muted-foreground">Action Item Text</p>
              <p className="font-semibold text-foreground mt-0.5 leading-snug">
                {item.text}
              </p>
            </div>

            {boards.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl">
                <p className="text-xs text-muted-foreground mb-3">
                  You have no Kanban boards yet. Create one first!
                </p>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/board");
                  }}
                  size="sm"
                  className="h-8 rounded-xl font-bold bg-primary text-primary-foreground text-xs cursor-pointer"
                >
                  Go to Boards
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Select Project Board
                  </label>
                  <Select
                    value={targetBoardId}
                    onValueChange={(value) => setTargetBoardId(value)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select Project Board" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Select Column
                    </label>
                    <Select
                      value={targetColumnId}
                      onValueChange={(value) => setTargetColumnId(value)}
                    >
                      <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select Column" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-card">
                        {targetColumns.map((col: any) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Priority
                    </label>
                    <Select
                      value={targetPriority}
                      onValueChange={(value) => setTargetPriority(value as any)}
                    >
                      <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-card">
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🔴 High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Assignee
                  </label>
                  <Select
                    value={conversionAssignee || "unassigned"}
                    onValueChange={(value) =>
                      setConversionAssignee(value === "unassigned" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {participants.map((p: any) => {
                        const u = p.user;
                        if (!u || typeof u === "string") return null;
                        return (
                          <SelectItem key={u._id} value={u._id}>
                            {u._id === currentUserId ? "You" : u.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-border bg-muted/5 hover:bg-muted/10 text-foreground rounded-full h-11 font-semibold transition-colors"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 font-bold gap-2 transition-all shadow-md cursor-pointer"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Create Task
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
