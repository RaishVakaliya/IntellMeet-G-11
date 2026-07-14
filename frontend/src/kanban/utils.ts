import { AlertCircle, CircleDot, CheckCircle2 } from "lucide-react";

export const PRIORITY_CONFIG = {
  high: {
    label: "High",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: CircleDot,
  },
  low: {
    label: "Low",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
} as const;

export const LABEL_COLORS = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
];

export const getLabelColor = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
};

export const formatDueDate = (
  date: string | null,
): { str: string; overdue: boolean; urgent?: boolean } | null => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const str = d.toLocaleDateString([], { month: "short", day: "numeric" });
  if (diffDays < 0) return { str, overdue: true };
  if (diffDays === 0) return { str: "Today", overdue: false, urgent: true };
  if (diffDays === 1) return { str: "Tomorrow", overdue: false, urgent: true };
  return { str, overdue: false };
};

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  labels: string[];
  dueDate: string;
  labelInput: string;
  columnId: string;
  assignedTo: string;
}

export const defaultForm = (columnId = ""): TaskFormData => ({
  title: "",
  description: "",
  priority: "medium",
  labels: [],
  dueDate: "",
  labelInput: "",
  columnId,
  assignedTo: "",
});
