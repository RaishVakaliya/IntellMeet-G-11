import React from "react";

interface MeetingSidebarTabsProps {
  sidebarTab: "chat" | "participants";
  setSidebarTab: (tab: "chat" | "participants") => void;
  participantsCount: number;
}

export const MeetingSidebarTabs: React.FC<MeetingSidebarTabsProps> = ({
  sidebarTab,
  setSidebarTab,
  participantsCount,
}) => {
  const tabs = [
    { id: "chat", label: "chat" },
    {
      id: "participants",
      label: `participants (${participantsCount})`,
    },
  ] as const;

  return (
    <div className="flex-1 flex overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSidebarTab(tab.id)}
          aria-label={`Switch to ${tab.label} tab`}
          aria-pressed={sidebarTab === tab.id}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            sidebarTab === tab.id
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
