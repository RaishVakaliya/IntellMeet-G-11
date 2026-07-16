import React, { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  getMeetingDetails,
  addActionItem,
  toggleActionItem,
  deleteActionItem,
  updateMeetingSummary,
  type MeetingDetails,
} from "../services/meetingService";
import {
  createTask,
  type Board,
  type CreateTaskData,
} from "../services/boardService";
import { SummarySection } from "./SummarySection";
import { ActionItemsSection } from "./ActionItemsSection";
import { ConvertTaskDialog } from "./ConvertTaskDialog";

interface MeetingInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingCode: string | null;
  boards: Board[];
  currentUserId: string;
}

export const MeetingInsightsDialog: React.FC<MeetingInsightsDialogProps> = ({
  open,
  onOpenChange,
  meetingCode,
  boards,
  currentUserId,
}) => {
  const qc = useQueryClient();
  const [taskConversionItem, setTaskConversionItem] = useState<{
    text: string;
    assignedTo: string | null;
    itemId: string;
  } | null>(null);

  const { data: meetingDetails, isLoading: detailsLoading } =
    useQuery<MeetingDetails>({
      queryKey: ["meeting-details", meetingCode],
      queryFn: () => getMeetingDetails(meetingCode!),
      enabled: !!meetingCode && open,
    });

  const addActionItemMutation = useMutation({
    mutationFn: ({
      code,
      text,
      assignedTo,
    }: {
      code: string;
      text: string;
      assignedTo?: string | null;
    }) => addActionItem(code, text, assignedTo),
    onSuccess: (_, { code }) => {
      toast.success("Action item added!");
      qc.invalidateQueries({ queryKey: ["meeting-details", code] });
    },
    onError: (e: Error) =>
      toast.error(e.message || "Failed to add action item"),
  });

  const toggleActionItemMutation = useMutation({
    mutationFn: ({ code, itemId }: { code: string; itemId: string }) =>
      toggleActionItem(code, itemId),
    onMutate: async ({ code, itemId }) => {
      await qc.cancelQueries({ queryKey: ["meeting-details", code] });
      const prev = qc.getQueryData<MeetingDetails>(["meeting-details", code]);
      if (prev) {
        qc.setQueryData<MeetingDetails>(["meeting-details", code], {
          ...prev,
          actionItems: (prev.actionItems || []).map((item) =>
            item._id === itemId
              ? { ...item, completed: !item.completed }
              : item,
          ),
        });
      }
      return { prev };
    },
    onError: (e: Error, { code }, ctx) => {
      toast.error(e.message);
      if (ctx?.prev) qc.setQueryData(["meeting-details", code], ctx.prev);
    },
    onSettled: (_, __, { code }) => {
      qc.invalidateQueries({ queryKey: ["meeting-details", code] });
    },
  });

  const deleteActionItemMutation = useMutation({
    mutationFn: ({ code, itemId }: { code: string; itemId: string }) =>
      deleteActionItem(code, itemId),
    onSuccess: (_, { code }) => {
      toast.success("Action item removed");
      qc.invalidateQueries({ queryKey: ["meeting-details", code] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateSummaryMutation = useMutation({
    mutationFn: ({ code, summary }: { code: string; summary: string }) =>
      updateMeetingSummary(code, summary),
    onSuccess: (_, { code }) => {
      toast.success("Summary updated!");
      qc.invalidateQueries({ queryKey: ["meeting-details", code] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string;
      data: CreateTaskData;
    }) => createTask(boardId, data),
    onSuccess: () => {
      toast.success("Kanban Task created successfully!");
      if (taskConversionItem && meetingCode) {
        toggleActionItemMutation.mutate({
          code: meetingCode,
          itemId: taskConversionItem.itemId,
        });
      }
      setTaskConversionItem(null);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create task"),
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onOpenChange(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-6 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span>Meeting Insights</span>
                <span className="text-xs text-muted-foreground font-normal mt-0.5">
                  Code: {meetingCode}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : meetingDetails ? (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/50 rounded-2xl p-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {meetingDetails.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hosted By</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {meetingDetails.createdBy?.name || "Host"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(meetingDetails.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {meetingDetails.participants.length} users
                  </p>
                </div>
              </div>

              <SummarySection
                summary={meetingDetails.summary || ""}
                isSaving={updateSummaryMutation.isPending}
                onSave={(summary) =>
                  updateSummaryMutation.mutate({
                    code: meetingDetails.meetingCode,
                    summary,
                  })
                }
              />

              <ActionItemsSection
                actionItems={meetingDetails.actionItems}
                participants={meetingDetails.participants}
                currentUserId={currentUserId}
                onToggle={(itemId) =>
                  toggleActionItemMutation.mutate({
                    code: meetingDetails.meetingCode,
                    itemId,
                  })
                }
                onDelete={(itemId) =>
                  deleteActionItemMutation.mutate({
                    code: meetingDetails.meetingCode,
                    itemId,
                  })
                }
                onAdd={(text, assignedTo) =>
                  addActionItemMutation.mutate({
                    code: meetingDetails.meetingCode,
                    text,
                    assignedTo,
                  })
                }
                onOpenConvert={(item) => setTaskConversionItem(item)}
              />
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground text-sm">
              Failed to load meeting details
            </p>
          )}
        </DialogContent>
      </Dialog>

      <ConvertTaskDialog
        open={!!taskConversionItem}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaskConversionItem(null);
        }}
        item={taskConversionItem}
        boards={boards}
        participants={meetingDetails?.participants}
        currentUserId={currentUserId}
        onCreateTask={(boardId, data) =>
          createTaskMutation.mutate({ boardId, data })
        }
        isCreating={createTaskMutation.isPending}
      />
    </>
  );
};
