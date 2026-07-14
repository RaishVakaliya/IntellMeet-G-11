import React from "react";
import { PRIORITY_CONFIG } from "./utils";

interface PrioritySelectorProps {
  value: "low" | "medium" | "high";
  onChange: (priority: "low" | "medium" | "high") => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["low", "medium", "high"] as const).map((p) => {
        const active = value === p;
        const cfg = PRIORITY_CONFIG[p];
        const Icon = cfg.icon;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              active
                ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-1 ring-current`
                : "border-border bg-muted/5 text-muted-foreground hover:bg-muted/15 hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
};
