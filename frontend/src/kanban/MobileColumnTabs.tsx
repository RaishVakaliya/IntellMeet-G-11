import React from "react";
import type { BoardColumn, Task } from "../services/boardService";

interface MobileColumnTabsProps {
  columns: BoardColumn[];
  activeMobileColId: string;
  setActiveMobileColId: (id: string) => void;
  getTasksByColumn: (colId: string) => Task[];
}

export const MobileColumnTabs: React.FC<MobileColumnTabsProps> = ({
  columns,
  activeMobileColId,
  setActiveMobileColId,
  getTasksByColumn,
}) => {
  return (
    <div className="flex sm:hidden overflow-x-auto gap-2 px-4 py-3 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-10 scrollbar-none">
      {columns.map((col) => {
        const colTasks = getTasksByColumn(col.id);
        const isActive = activeMobileColId === col.id;
        return (
          <button
            key={col.id}
            onClick={() => setActiveMobileColId(col.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              isActive
                ? "text-white shadow-md shadow-primary/5"
                : "text-muted-foreground bg-muted/30 hover:bg-muted/50 hover:text-foreground"
            }`}
            style={{
              backgroundColor: isActive ? col.color : undefined,
            }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : ""}`}
              style={{ backgroundColor: isActive ? undefined : col.color }}
            />
            {col.title}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {colTasks.length}
            </span>
          </button>
        );
      })}
    </div>
  );
};
