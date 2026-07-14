import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

export interface AssigneeUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface AssigneeSelectorProps {
  value: string;
  onChange: (val: string) => void;
  users: AssigneeUser[];
  currentUserId: string;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  value,
  onChange,
  users,
  currentUserId,
}) => {
  return (
    <Select
      value={value || "unassigned"}
      onValueChange={(val) => onChange(val === "unassigned" ? "" : val)}
    >
      <SelectTrigger className="w-full rounded-xl border-border bg-card text-foreground h-11 text-sm focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="Select assignee" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border bg-card">
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {users.map((u) => (
          <SelectItem key={u._id} value={u._id}>
            {u._id === currentUserId ? "You" : u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
