export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0)
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (days === 1)
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatDuration = (start: string, end?: string) => {
  if (!end) return null;
  const mins = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const statusConfig = {
  ongoing: {
    label: "Live",
    class:
      "border-primary/50 text-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] font-bold animate-[pulse_3s_infinite]",
    dot: "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]",
  },
  scheduled: {
    label: "Scheduled",
    class:
      "border-primary/50 text-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] font-bold",
    dot: "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]",
  },
  ended: {
    label: "Ended",
    class: "border-muted text-muted-foreground bg-transparent font-bold",
    dot: "bg-muted",
  },
} as const;
