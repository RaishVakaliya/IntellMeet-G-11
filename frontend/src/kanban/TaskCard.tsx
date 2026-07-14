import React from "react";
import { GripVertical, Clock, Edit3, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import type { Task } from "../services/boardService";
import { PRIORITY_CONFIG, getLabelColor, formatDueDate } from "./utils";

import type { User } from "../types/auth";

interface TaskCardProps {
  task: Task;
  authStoreUser: User | null;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  draggingId: string | null;
  openEdit: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  authStoreUser,
  onDragStart,
  onDragEnd,
  draggingId,
  openEdit,
  onDeleteTask,
}) => {
  const pCfg = PRIORITY_CONFIG[task.priority];
  const due = formatDueDate(task.dueDate);
  const isDragging = draggingId === task._id;

  return (
    <div
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

          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
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
                      : due.urgent
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
                        : "text-muted-foreground bg-muted border-border"
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {due.str}
                </span>
              )}
            </div>
            {task.assignedTo && (
              <Avatar
                className="w-6 h-6 border border-primary/30 shrink-0 cursor-help"
                title={`Assigned to ${task.assignedTo._id === authStoreUser?._id ? "You" : task.assignedTo.name}`}
              >
                <AvatarImage
                  src={task.assignedTo.avatar}
                  alt={task.assignedTo.name}
                />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  {task.assignedTo.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openEdit(task)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDeleteTask(task._id)}
          className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
