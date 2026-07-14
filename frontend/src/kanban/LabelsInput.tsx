import React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getLabelColor } from "./utils";

interface LabelsInputProps {
  labels: string[];
  labelInput: string;
  onLabelInputChange: (val: string) => void;
  onAddLabel: () => void;
  onRemoveLabel: (lbl: string) => void;
  onTogglePresetLabel: (preset: string) => void;
}

export const LabelsInput: React.FC<LabelsInputProps> = ({
  labels,
  labelInput,
  onLabelInputChange,
  onAddLabel,
  onRemoveLabel,
  onTogglePresetLabel,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Bug, Frontend..."
          value={labelInput}
          onChange={(e) => onLabelInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddLabel();
            }
          }}
          className="rounded-xl border-border bg-muted/5 h-10 px-4 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onAddLabel}
          className="shrink-0 rounded-xl border-border hover:bg-muted/10 h-10 px-3 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center mt-2.5">
        <span className="text-[11px] text-muted-foreground mr-1">
          Suggestions:
        </span>
        {["Bug", "Feature", "Refactor", "Design", "Marketing"].map((preset) => {
          const active = labels.includes(preset);
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onTogglePresetLabel(preset)}
              className={`text-xs px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                active
                  ? `${getLabelColor(preset)} border-current ring-1 ring-current/30`
                  : "border-border bg-muted/5 text-muted-foreground hover:bg-muted/15 hover:text-foreground"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-border/30">
          {labels.map((lbl) => (
            <span
              key={lbl}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${getLabelColor(lbl)}`}
            >
              {lbl}
              <button
                onClick={() => onRemoveLabel(lbl)}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
