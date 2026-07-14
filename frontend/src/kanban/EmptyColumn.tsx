import React from "react";

interface EmptyColumnProps {
  isOver: boolean;
}

export const EmptyColumn: React.FC<EmptyColumnProps> = ({ isOver }) => {
  return (
    <div
      className={`rounded-xl border-2 border-dashed transition-colors h-20 flex items-center justify-center ${
        isOver ? "border-primary/50 bg-primary/5" : "border-border/50"
      }`}
    >
      <p className="text-xs text-muted-foreground">
        {isOver ? "Drop here" : "No tasks"}
      </p>
    </div>
  );
};
