import { Meeting } from "../models/meetingModel.js";
import redisClient from "../config/redis.js";
import { createActionItemNotification } from "../services/notificationService.js";

const CACHE_EXPIRATION = 3600;

const getMeetingPopulated = (code) =>
  Meeting.findOne({ meetingCode: code })
    .populate("participants.user", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("actionItems.assignedTo", "name email avatar");

export const addActionItem = async (req, res) => {
  try {
    const { code } = req.params;
    const { text, assignedTo } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Action item text is required" });
    }

    const meeting = await Meeting.findOne({ meetingCode: code });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    meeting.actionItems.push({
      text: text.trim(),
      assignedTo: assignedTo || null,
      completed: false,
    });
    await meeting.save();

    if (assignedTo) {
      createActionItemNotification(code, req.user._id, assignedTo, text.trim());
    }

    const updatedMeeting = await getMeetingPopulated(code);

    if (redisClient.isOpen) {
      await redisClient.del(`meeting:${code}`);
    }

    res.status(201).json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error adding action item" });
  }
};

export const toggleActionItem = async (req, res) => {
  try {
    const { code, itemId } = req.params;

    const meeting = await Meeting.findOne({ meetingCode: code });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const item = meeting.actionItems.id(itemId);
    if (!item)
      return res.status(404).json({ message: "Action item not found" });

    item.completed = !item.completed;
    await meeting.save();

    const updatedMeeting = await getMeetingPopulated(code);

    if (redisClient.isOpen) {
      await redisClient.del(`meeting:${code}`);
    }

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error toggling action item" });
  }
};

export const deleteActionItem = async (req, res) => {
  try {
    const { code, itemId } = req.params;

    const meeting = await Meeting.findOne({ meetingCode: code });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    meeting.actionItems.pull({ _id: itemId });
    await meeting.save();

    const updatedMeeting = await getMeetingPopulated(code);

    if (redisClient.isOpen) {
      await redisClient.del(`meeting:${code}`);
    }

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error deleting action item" });
  }
};

export const updateMeetingSummary = async (req, res) => {
  try {
    const { code } = req.params;
    const { summary } = req.body;

    const meeting = await Meeting.findOneAndUpdate(
      { meetingCode: code },
      { summary: summary || "" },
      { new: true },
    )
      .populate("actionItems.assignedTo", "name email avatar")
      .populate("participants.user", "name email avatar")
      .populate("createdBy", "name email avatar");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (redisClient.isOpen) {
      await redisClient.del(`meeting:${code}`);
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error updating summary" });
  }
};
