import React from "react";
import type { BoardColumn, Task } from "../services/boardService";
import { KanbanColumn } from "./KanbanColumn";
import type { User } from "../types/auth";

interface BoardColumnsProps {
  columns: BoardColumn[];
  activeMobileColId: string;
  getTasksByColumn: (colId: string) => Task[];
  dragOverColId: string | null;
  onDragOverColumn: (e: React.DragEvent, colId: string) => void;
  onDragLeave: () => void;
  onDropColumn: (e: React.DragEvent, colId: string) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  draggingId: string | null;
  authStoreUser: User | null;
  openCreate: (colId: string) => void;
  openEdit: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const BoardColumns: React.FC<BoardColumnsProps> = ({
  columns,
  activeMobileColId,
  getTasksByColumn,
  dragOverColId,
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
    <div className="flex flex-col sm:flex-row gap-5 px-4 sm:px-6 pt-6 pb-24 sm:py-6 h-full min-h-[calc(100vh-8rem)] w-full sm:w-max sm:mx-auto sm:justify-center">
      {columns.map((col) => {
        const colTasks = getTasksByColumn(col.id);
        const isOver = dragOverColId === col.id;
        const isVisible = activeMobileColId === col.id;
        return (
          <KanbanColumn
            key={col.id}
            col={col}
            colTasks={colTasks}
            isOver={isOver}
            isVisible={isVisible}
            onDragOverColumn={onDragOverColumn}
            onDragLeave={onDragLeave}
            onDropColumn={onDropColumn}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggingId={draggingId}
            authStoreUser={authStoreUser}
            openCreate={openCreate}
            openEdit={openEdit}
            onDeleteTask={onDeleteTask}
          />
        );
      })}
    </div>
  );
};
