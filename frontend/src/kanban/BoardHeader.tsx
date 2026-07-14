import React from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface BoardHeaderProps {
  board: {
    title: string;
    description?: string;
    color: string;
  };
  tasksCount: number;
  onBack: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  tasksCount,
  onBack,
}) => {
  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          {tasksCount} tasks
        </Badge>
      </div>
    </div>
  );
};
