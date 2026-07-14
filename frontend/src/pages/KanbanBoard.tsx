import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
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
import { useDocumentSEO } from "@/hooks/useDocumentSEO";
import { AppNavbar } from "../layouts/AppNavbar";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// Extracted Kanban modular components
import { BoardHeader } from "../kanban/BoardHeader";
import { MobileColumnTabs } from "../kanban/MobileColumnTabs";
import { BoardColumns } from "../kanban/BoardColumns";
import { TaskDialog } from "../kanban/TaskDialog";
import { DeleteTaskDialog } from "../kanban/DeleteTaskDialog";
import { useTaskDialog } from "../kanban/hooks/useTaskDialog";

const KanbanBoard = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const authStoreUser = useAuthStore((s) => s.user);

  // Hook managing dialogs state and form parameters
  const taskDialogHook = useTaskDialog();
  const {
    taskDialog,
    form,
    setForm,
    openCreate,
    openEdit,
    closeDialog,
    addLabel,
    removeLabel,
    togglePresetLabel,
  } = taskDialogHook;

  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(
    null,
  );

  // Drag and Drop Ref tracking
  const dragTask = useRef<Task | null>(null);
  const dragOverCol = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Fetch Board Details
  const { data, isLoading, isError } = useQuery<BoardWithTasks>({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId!),
    enabled: !!boardId,
    staleTime: 10_000,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiFetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const board = data?.board;
  const tasks = data?.tasks ?? [];
  const columns: BoardColumn[] = board?.columns
    ? [...board.columns].sort((a, b) => a.order - b.order)
    : [];

  useDocumentSEO({
    title: board?.title ? `${board.title} — Kanban Board` : "Kanban Board",
    description: board?.description
      ? board.description
      : "Manage tasks and track team progress on this interactive Kanban board in IntellMeet.",
    keywords: "Kanban board, task management, team collaboration, IntellMeet",
  });

  const [activeMobileColId, setActiveMobileColId] = useState<string>("");

  useEffect(() => {
    if (columns.length > 0 && !activeMobileColId) {
      setActiveMobileColId(columns[0].id);
    }
  }, [columns, activeMobileColId]);

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

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      labels: form.labels,
      dueDate: form.dueDate || null,
      column: form.columnId,
      assignedTo: form.assignedTo || null,
    };
    if (taskDialog.mode === "create") {
      createMutation.mutate({ ...payload, column: form.columnId });
    } else if (taskDialog.task) {
      updateMutation.mutate({ taskId: taskDialog.task._id, data: payload });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <BoardHeader
        board={board}
        tasksCount={tasks.length}
        onBack={() => navigate("/board")}
      />

      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden">
        <MobileColumnTabs
          columns={columns}
          activeMobileColId={activeMobileColId}
          setActiveMobileColId={setActiveMobileColId}
          getTasksByColumn={getTasksByColumn}
        />

        <BoardColumns
          columns={columns}
          activeMobileColId={activeMobileColId}
          getTasksByColumn={getTasksByColumn}
          dragOverColId={dragOverColId}
          onDragOverColumn={onDragOverColumn}
          onDragLeave={() => setDragOverColId(null)}
          onDropColumn={onDropColumn}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          draggingId={draggingId}
          authStoreUser={authStoreUser}
          openCreate={openCreate}
          openEdit={openEdit}
          onDeleteTask={(id) => setDeleteTaskConfirm(id)}
        />
      </div>

      <TaskDialog
        open={taskDialog.open}
        onClose={closeDialog}
        mode={taskDialog.mode}
        columns={columns}
        form={form}
        setForm={setForm}
        users={users}
        currentUserId={authStoreUser?._id || ""}
        onSubmit={handleSubmit}
        isMutating={isMutating}
        addLabel={addLabel}
        removeLabel={removeLabel}
        togglePresetLabel={togglePresetLabel}
      />

      <DeleteTaskDialog
        open={!!deleteTaskConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteTaskConfirm(null);
        }}
        onConfirm={() => {
          if (deleteTaskConfirm) {
            deleteMutation.mutate(deleteTaskConfirm);
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default KanbanBoard;
