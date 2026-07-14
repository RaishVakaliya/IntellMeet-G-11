import React, { useState } from "react";
import { CheckSquare, Check, Layers, Trash2, Plus } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import type {
  MeetingDetails,
  MeetingParticipantRecord,
} from "../services/meetingService";

interface ActionItemsSectionProps {
  actionItems?: MeetingDetails["actionItems"];
  participants: MeetingDetails["participants"];
  currentUserId: string;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onAdd: (text: string, assignee: string | null) => void;
  onOpenConvert: (item: {
    text: string;
    assignedTo: string | null;
    itemId: string;
  }) => void;
}

export const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({
  actionItems,
  participants,
  currentUserId,
  onToggle,
  onDelete,
  onAdd,
  onOpenConvert,
}) => {
  const [actionItemInput, setActionItemInput] = useState("");
  const [actionItemAssignee, setActionItemAssignee] = useState("");

  const handleAdd = () => {
    if (!actionItemInput.trim()) return;
    onAdd(actionItemInput.trim(), actionItemAssignee || null);
    setActionItemInput("");
    setActionItemAssignee("");
  };

  return (
    <div className="space-y-3 border-t border-border/30 pt-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
        <CheckSquare className="w-4 h-4 text-primary" /> Action Items
      </h3>

      <div className="space-y-2">
        {actionItems && actionItems.length > 0 ? (
          actionItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3 bg-muted/10 border border-border/20 rounded-xl px-4 py-3 hover:bg-muted/15 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggle(item._id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    item.completed
                      ? "bg-primary border-primary text-white"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm text-foreground font-medium truncate ${
                      item.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.assignedTo && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Assigned to:{" "}
                      <span className="font-semibold text-foreground">
                        {item.assignedTo._id === currentUserId
                          ? "You"
                          : item.assignedTo.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    onOpenConvert({
                      text: item.text,
                      assignedTo: item.assignedTo?._id || null,
                      itemId: item._id,
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title="Convert to Kanban Task"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Remove action item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/5 border border-dashed border-border rounded-xl">
            No action items captured yet.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1.5">
        <Input
          placeholder="Capture new action item..."
          value={actionItemInput}
          onChange={(e) => setActionItemInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 rounded-xl h-10 border-border bg-muted/5 px-4 placeholder:text-muted-foreground/60 text-sm focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2">
          <Select
            value={actionItemAssignee || "unassigned"}
            onValueChange={(value) =>
              setActionItemAssignee(value === "unassigned" ? "" : value)
            }
          >
            <SelectTrigger className="rounded-xl border-border bg-card text-foreground text-xs h-10 focus:ring-2 focus:ring-primary/20 min-w-[130px]">
              <SelectValue placeholder="Assignee..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="unassigned">Assignee...</SelectItem>
              {participants.map((p: MeetingParticipantRecord) => {
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
          <Button
            onClick={handleAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-4 font-bold text-xs cursor-pointer gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};
