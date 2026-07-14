import React from "react";

interface DashboardHeaderProps {
  username: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  username,
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        Welcome back, <span className="text-muted-foreground">{username}</span>{" "}
        👋
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        Start or join a secure video meeting
      </p>
    </div>
  );
};
