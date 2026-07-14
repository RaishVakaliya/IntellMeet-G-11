import React from "react";
import {
  Plus,
  Edit3,
  Flag,
  Calendar,
  Users,
  Tag,
  Layers,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { PrioritySelector } from "./PrioritySelector";
import { AssigneeSelector } from "./AssigneeSelector";
import { LabelsInput } from "./LabelsInput";
import type { TaskFormData } from "./utils";
import type { BoardColumn } from "../services/boardService";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  columns: BoardColumn[];
  form: TaskFormData;
  setForm: React.Dispatch<React.SetStateAction<TaskFormData>>;
  users: any[];
  currentUserId: string;
  onSubmit: () => void;
  isMutating: boolean;
  addLabel: () => void;
  removeLabel: (lbl: string) => void;
  togglePresetLabel: (preset: string) => void;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  mode,
  columns,
  form,
  setForm,
  users,
  currentUserId,
  onSubmit,
  isMutating,
  addLabel,
  removeLabel,
  togglePresetLabel,
}) => {
  const activeColTitle =
    columns.find((c) => c.id === form.columnId)?.title || form.columnId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              {mode === "create" ? (
                <Plus className="w-4 h-4 text-primary" />
              ) : (
                <Edit3 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex flex-col items-start leading-none">
              <span>{mode === "create" ? "New Task" : "Edit Task"}</span>
              <span className="text-[11px] font-normal text-muted-foreground mt-1">
                in column{" "}
                <span className="font-semibold text-foreground">
                  {activeColTitle}
                </span>
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Title
            </label>
            <Input
              placeholder="e.g. Design landing page, Fix login bug..."
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) onSubmit();
              }}
              className="rounded-xl border-border bg-muted/5 h-11 px-4 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Description{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </label>
            <textarea
              placeholder="Describe what needs to be done in this task..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-border bg-muted/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-muted-foreground" /> Priority
            </label>
            <PrioritySelector
              value={form.priority}
              onChange={(val) => setForm((f) => ({ ...f, priority: val }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-muted-foreground" /> Status
              </label>
              <Select
                value={form.columnId}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, columnId: val }))
                }
              >
                <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" /> Due Date
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="rounded-xl border-border bg-muted/5 h-11 px-4 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted-foreground" /> Assignee
            </label>
            <AssigneeSelector
              value={form.assignedTo}
              onChange={(val) => setForm((f) => ({ ...f, assignedTo: val }))}
              users={users}
              currentUserId={currentUserId}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-muted-foreground" /> Labels
            </label>
            <LabelsInput
              labels={form.labels}
              labelInput={form.labelInput}
              onLabelInputChange={(val) =>
                setForm((f) => ({ ...f, labelInput: val }))
              }
              onAddLabel={addLabel}
              onRemoveLabel={removeLabel}
              onTogglePresetLabel={togglePresetLabel}
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              className="flex-1 border-border bg-muted/5 hover:bg-muted/10 text-foreground rounded-full h-11 font-semibold transition-colors"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 font-bold gap-2 transition-all shadow-md cursor-pointer"
              onClick={onSubmit}
              disabled={isMutating}
            >
              {isMutating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "create" ? (
                <>
                  <Plus className="w-4 h-4" /> Create Task
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
