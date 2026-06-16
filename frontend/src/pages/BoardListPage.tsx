import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMyBoards,
  createBoard,
  deleteBoard,
  type Board,
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
  Plus,
  Layers,
  Trash2,
  ArrowRight,
  CheckSquare,
  Loader2,
  LayoutDashboard,
} from "lucide-react";

const BOARD_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
];

const BoardListPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(BOARD_COLORS[0].value);

  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["my-boards"],
    queryFn: getMyBoards,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: (board) => {
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      toast.success("Board created!");
      setDialogOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewColor(BOARD_COLORS[0].value);
      navigate(`/board/${board._id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      toast.success("Board deleted");
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Board title is required");
      return;
    }
    createMutation.mutate({
      title: newTitle,
      description: newDesc,
      color: newColor,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              Project Boards
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your tasks with Kanban boards
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold"
          >
            <Plus className="w-4 h-4" /> New Board
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/10">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-7 h-7 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">
              No boards yet
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Create your first Kanban board to start organizing tasks
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 bg-primary text-primary-foreground rounded-xl font-bold"
            >
              <Plus className="w-4 h-4" /> Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map((board) => (
              <div
                key={board._id}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: board.color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: board.color + "22",
                        border: `1px solid ${board.color}44`,
                      }}
                    >
                      <LayoutDashboard
                        className="w-5 h-5"
                        style={{ color: board.color }}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(board._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-foreground text-base leading-snug">
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground bg-muted/50 flex items-center gap-1"
                    >
                      <CheckSquare className="w-3 h-3" />
                      {board.taskCount ?? 0} tasks
                    </Badge>
                    <ArrowRight
                      className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 transition-transform"
                      style={{ color: board.color }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setDialogOpen(true)}
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/3 transition-all duration-200 h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">New Board</span>
            </button>
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-primary" />
              </div>
              Create New Board
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Board Name
              </label>
              <Input
                placeholder="e.g. Sprint 1, Marketing Tasks..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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
              <Input
                placeholder="What is this board for?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="rounded-xl border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full transition-all ${
                      newColor === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: c.value,
                      ringColor: c.value,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-border rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold gap-2"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </div>
              Delete Board
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the board and all its tasks. This
            action cannot be undone.
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 border-border rounded-xl"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
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

export default BoardListPage;
