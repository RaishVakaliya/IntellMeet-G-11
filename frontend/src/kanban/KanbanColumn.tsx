import React from "react";
import { Plus } from "lucide-react";
import type { BoardColumn, Task } from "../services/boardService";
import { TaskCard } from "./TaskCard";
import { EmptyColumn } from "./EmptyColumn";

interface KanbanColumnProps {
  col: BoardColumn;
  colTasks: Task[];
  isOver: boolean;
  isVisible: boolean;
  onDragOverColumn: (e: React.DragEvent, colId: string) => void;
  onDragLeave: () => void;
  onDropColumn: (e: React.DragEvent, colId: string) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  draggingId: string | null;
  authStoreUser: any;
  openCreate: (colId: string) => void;
  openEdit: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  col,
  colTasks,
  isOver,
  isVisible,
  onDragOverColumn,
  onDragLeave,
  onDropColumn,
  onDragStart,
  onDragEnd,
  draggingId,
  authStoreUser,
  openCreate,
  openEdit,
  onDeleteTask,
}) => {
  return (
    <div
      className={`flex-col w-full sm:w-72 shrink-0 rounded-2xl border transition-all duration-150 ${
        isVisible ? "flex" : "hidden sm:flex"
      } ${
        isOver
          ? "border-primary/50 bg-primary/3 shadow-lg shadow-primary/10"
          : "border-border bg-card"
      }`}
      onDragOver={(e) => onDragOverColumn(e, col.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDropColumn(e, col.id)}
    >
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: col.color }}
          />
          <span className="text-sm font-bold text-foreground">{col.title}</span>
          <span className="text-xs text-muted-foreground font-mono bg-muted rounded-full px-1.5 py-0.5">
            {colTasks.length}
          </span>
        </div>
        <button
          onClick={() => openCreate(col.id)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[120px]">
        {colTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            authStoreUser={authStoreUser}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggingId={draggingId}
            openEdit={openEdit}
            onDeleteTask={onDeleteTask}
          />
        ))}

        {colTasks.length === 0 && <EmptyColumn isOver={isOver} />}
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={() => openCreate(col.id)}
          className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted group/add cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 group-hover/add:text-primary transition-colors" />
          Add task
        </button>
      </div>
    </div>
  );
};
