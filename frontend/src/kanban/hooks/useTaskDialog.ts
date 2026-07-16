import { useState, useCallback } from "react";
import type { Task } from "../../services/boardService";
import { defaultForm, type TaskFormData } from "../utils";

export const useTaskDialog = () => {
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    column?: string;
    task?: Task;
  }>({ open: false, mode: "create" });

  const [form, setForm] = useState<TaskFormData>(defaultForm());

  const openCreate = useCallback((colId: string) => {
    setForm(defaultForm(colId));
    setTaskDialog({ open: true, mode: "create", column: colId });
  }, []);

  const openEdit = useCallback((task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      labels: task.labels,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      labelInput: "",
      columnId: task.column,
      assignedTo: task.assignedTo
        ? typeof task.assignedTo === "object"
          ? task.assignedTo._id
          : task.assignedTo
        : "",
    });
    setTaskDialog({ open: true, mode: "edit", task });
  }, []);

  const closeDialog = () => {
    setTaskDialog({ open: false, mode: "create" });
    setForm(defaultForm());
  };

  const addLabel = () => {
    const lbl = form.labelInput.trim();
    if (lbl && !form.labels.includes(lbl)) {
      setForm((f) => ({ ...f, labels: [...f.labels, lbl], labelInput: "" }));
    }
  };

  const removeLabel = (lbl: string) => {
    setForm((f) => ({ ...f, labels: f.labels.filter((l) => l !== lbl) }));
  };

  const togglePresetLabel = (preset: string) => {
    setForm((f) => {
      const active = f.labels.includes(preset);
      return {
        ...f,
        labels: active
          ? f.labels.filter((l) => l !== preset)
          : [...f.labels, preset],
      };
    });
  };

  return {
    taskDialog,
    form,
    setForm,
    openCreate,
    openEdit,
    closeDialog,
    addLabel,
    removeLabel,
    togglePresetLabel,
  };
};
