import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBoardById,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  type Task,
  type BoardWithTasks,
  type BoardColumn,
} from "../services/boardService";
import { AppNavbar } from "../layouts/AppNavbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Flag,
  Tag,
  X,
  GripVertical,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Clock,
  CircleDot,
} from "lucide-react";

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: CircleDot,
  },
  low: {
    label: "Low",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
} as const;

const LABEL_COLORS = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
];

const getLabelColor = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
};

const formatDueDate = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const str = d.toLocaleDateString([], { month: "short", day: "numeric" });
  if (diffDays < 0) return { str, overdue: true };
  if (diffDays === 0) return { str: "Today", overdue: false, urgent: true };
  if (diffDays === 1) return { str: "Tomorrow", overdue: false, urgent: true };
  return { str, overdue: false };
};

interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  labels: string[];
  dueDate: string;
  labelInput: string;
}

const defaultForm = (): TaskFormData => ({
  title: "",
  description: "",
  priority: "medium",
  labels: [],
  dueDate: "",
  labelInput: "",
});

const KanbanBoard = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    column?: string;
    task?: Task;
  }>({ open: false, mode: "create" });

  const [form, setForm] = useState<TaskFormData>(defaultForm());
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(
    null,
  );

  const dragTask = useRef<Task | null>(null);
  const dragOverCol = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<BoardWithTasks>({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId!),
    enabled: !!boardId,
    staleTime: 10_000,
  });

  const board = data?.board;
  const tasks = data?.tasks ?? [];

  const getTasksByColumn = useCallback(
    (colId: string) =>
      tasks.filter((t) => t.column === colId).sort((a, b) => a.order - b.order),
    [tasks],
  );

  const createMutation = useMutation({
    mutationFn: (d: Parameters<typeof createTask>[1]) =>
      createTask(boardId!, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      toast.success("Task created!");
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Parameters<typeof updateTask>[2];
    }) => updateTask(boardId!, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task updated!");
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveMutation = useMutation({
    mutationFn: ({
      taskId,
      column,
      order,
    }: {
      taskId: string;
      column: string;
      order: number;
    }) => moveTask(boardId!, taskId, column, order),
    onMutate: async ({ taskId, column, order }) => {
      await qc.cancelQueries({ queryKey: ["board", boardId] });
      const prev = qc.getQueryData<BoardWithTasks>(["board", boardId]);
      if (prev) {
        qc.setQueryData<BoardWithTasks>(["board", boardId], {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t._id === taskId ? { ...t, column, order } : t,
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["board", boardId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(boardId!, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      toast.success("Task deleted");
      setDeleteTaskConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = (colId: string) => {
    setForm({ ...defaultForm() });
    setTaskDialog({ open: true, mode: "create", column: colId });
  };

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      labels: task.labels,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      labelInput: "",
    });
    setTaskDialog({ open: true, mode: "edit", task });
  };

  const closeDialog = () => {
    setTaskDialog({ open: false, mode: "create" });
    setForm(defaultForm());
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      labels: form.labels,
      dueDate: form.dueDate || null,
    };
    if (taskDialog.mode === "create") {
      createMutation.mutate({ ...payload, column: taskDialog.column! });
    } else if (taskDialog.task) {
      updateMutation.mutate({ taskId: taskDialog.task._id, data: payload });
    }
  };

  const addLabel = () => {
    const lbl = form.labelInput.trim();
    if (lbl && !form.labels.includes(lbl)) {
      setForm((f) => ({ ...f, labels: [...f.labels, lbl], labelInput: "" }));
    }
  };

  const onDragStart = (task: Task) => {
    dragTask.current = task;
    setDraggingId(task._id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverColId(null);
    dragTask.current = null;
    dragOverCol.current = null;
  };

  const onDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    dragOverCol.current = colId;
    setDragOverColId(colId);
  };

  const onDropColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.column === colId) {
      onDragEnd();
      return;
    }
    const colTasks = getTasksByColumn(colId);
    moveMutation.mutate({
      taskId: task._id,
      column: colId,
      order: colTasks.length,
    });
    onDragEnd();
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
          <p className="text-muted-foreground">Board not found</p>
          <Button onClick={() => navigate("/board")} variant="outline">
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  const columns: BoardColumn[] = [...board.columns].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/board")}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: board.color }}
          />
          <h1 className="font-bold text-foreground text-lg">{board.title}</h1>
          {board.description && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              — {board.description}
            </span>
          )}
          <Badge
            variant="outline"
            className="ml-auto text-xs border-border text-muted-foreground"
          >
            {tasks.length} tasks
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div
          className="flex gap-5 px-6 py-6 h-full min-h-[calc(100vh-8rem)]"
          style={{ minWidth: "max-content" }}
        >
          {columns.map((col) => {
            const colTasks = getTasksByColumn(col.id);
            const isOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                className={`flex flex-col w-72 shrink-0 rounded-2xl border transition-all duration-150 ${
                  isOver
                    ? "border-primary/50 bg-primary/3 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
                onDragOver={(e) => onDragOverColumn(e, col.id)}
                onDragLeave={() => setDragOverColId(null)}
                onDrop={(e) => onDropColumn(e, col.id)}
              >
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="text-sm font-bold text-foreground">
                      {col.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted rounded-full px-1.5 py-0.5">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreate(col.id)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Add task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[120px]">
                  {colTasks.map((task) => {
                    const pCfg = PRIORITY_CONFIG[task.priority];
                    const due = formatDueDate(task.dueDate);
                    const isDragging = draggingId === task._id;

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={() => onDragStart(task)}
                        onDragEnd={onDragEnd}
                        className={`group rounded-xl border bg-background p-3.5 cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-primary/30 hover:shadow-md ${
                          isDragging
                            ? "opacity-40 scale-95 shadow-xl border-primary/50"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.labels.map((lbl) => (
                                  <span
                                    key={lbl}
                                    className={`text-xs px-1.5 py-0.5 rounded-md border font-medium ${getLabelColor(lbl)}`}
                                  >
                                    {lbl}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md border ${pCfg.color} ${pCfg.bg} ${pCfg.border}`}
                              >
                                <pCfg.icon className="w-2.5 h-2.5" />
                                {pCfg.label}
                              </span>

                              {due && (
                                <span
                                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border font-medium ${
                                    due.overdue
                                      ? "text-red-500 bg-red-500/10 border-red-500/30"
                                      : (due as any).urgent
                                        ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
                                        : "text-muted-foreground bg-muted border-border"
                                  }`}
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  {due.str}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(task)}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteTaskConfirm(task._id)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div
                      className={`rounded-xl border-2 border-dashed transition-colors h-20 flex items-center justify-center ${
                        isOver
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/50"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">
                        {isOver ? "Drop here" : "No tasks"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-3 pb-3">
                  <button
                    onClick={() => openCreate(col.id)}
                    className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted group/add"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover/add:text-primary transition-colors" />
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={taskDialog.open} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                {taskDialog.mode === "create" ? (
                  <Plus className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              {taskDialog.mode === "create" ? "New Task" : "Edit Task"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                placeholder="Task title..."
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSubmit();
                }}
                className="rounded-xl border-border"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                placeholder="Add more details..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as TaskFormData["priority"],
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="rounded-xl border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Labels
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add label..."
                  value={form.labelInput}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, labelInput: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                  className="rounded-xl border-border text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLabel}
                  className="shrink-0 rounded-xl border-border"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.labels.map((lbl) => (
                    <span
                      key={lbl}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${getLabelColor(lbl)}`}
                    >
                      {lbl}
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            labels: f.labels.filter((l) => l !== lbl),
                          }))
                        }
                        className="hover:opacity-70"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-border rounded-xl"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold gap-2"
                onClick={handleSubmit}
                disabled={isMutating}
              >
                {isMutating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : taskDialog.mode === "create" ? (
                  <>
                    <Plus className="w-4 h-4" /> Create
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" /> Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTaskConfirm}
        onOpenChange={() => setDeleteTaskConfirm(null)}
      >
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
              onClick={() => setDeleteTaskConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
              onClick={() =>
                deleteTaskConfirm && deleteMutation.mutate(deleteTaskConfirm)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
