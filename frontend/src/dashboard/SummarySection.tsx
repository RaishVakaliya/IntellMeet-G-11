import React, { useState } from "react";
import { FileText, Edit3 } from "lucide-react";

interface SummarySectionProps {
  summary: string;
  onSave: (summary: string) => void;
  isSaving: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  summary,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(summary);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2.5 border-t border-border/30 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" /> AI Meeting Summary
        </h3>
        {!isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              setInputValue(summary);
            }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-muted-foreground hover:underline font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Provide a summary of the meeting..."
          rows={4}
          className="w-full rounded-xl border border-border bg-muted/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/10 border border-border/20 rounded-xl px-4 py-3 min-h-[60px] whitespace-pre-wrap">
          {summary || "No summary generated. Click Edit to add one!"}
        </p>
      )}
    </div>
  );
};
