import { Notification } from "../models/notificationModel.js";
import { Meeting } from "../models/meetingModel.js";
import User from "../models/userModel.js";
import { getIO } from "../sockets/socket.js";

export const handleChatMentions = async (meetingCode, senderId, messageText) => {
  try {
    // Matches patterns like @john, @john.doe, @john@example.com
    const mentionRegex = /@([\w.-]+(?:@[\w.-]+)?)/g;
    const matches = [...messageText.matchAll(mentionRegex)].map(m => m[1]);

    if (matches.length === 0) return;

    // Remove duplicates
    const uniqueMatches = [...new Set(matches)];

    // Fetch meeting details for title & id
    const meeting = await Meeting.findOne({ meetingCode });
    const meetingId = meeting ? meeting._id : null;
    const meetingTitle = meeting ? meeting.title : "a meeting";

    // Find sender's name
    const sender = await User.findById(senderId);
    const senderName = sender ? sender.name : "Someone";

    for (const match of uniqueMatches) {
      // Find recipient user by name (case-insensitive) or email
      const recipient = await User.findOne({
        $or: [
          { email: match },
          { name: { $regex: new RegExp(`^${match}$`, "i") } },
        ],
      });

      if (!recipient) continue;

      // Don't notify the sender themselves
      if (recipient._id.toString() === senderId.toString()) continue;

      // Create notification in DB
      const notification = await Notification.create({
        recipient: recipient._id,
        sender: senderId,
        type: "mention",
        title: `Mentioned in ${meetingTitle}`,
        message: `${senderName} mentioned you in chat: "${messageText}"`,
        relatedMeeting: meetingId,
      });

      // Populate sender info for the frontend
      const populatedNotification = await notification.populate("sender", "name email avatar");

      // Emit real-time socket notification to the recipient
      try {
        const io = getIO();
        io.to(`user:${recipient._id}`).emit("new-notification", populatedNotification);
      } catch (err) {
        console.warn("Socket.IO not ready/available during mention emit:", err.message);
      }
    }
  } catch (error) {
    console.error("Error handling chat mentions:", error);
  }
};

export const createActionItemNotification = async (meetingCode, assignerId, assigneeId, actionText) => {
  try {
    const meeting = await Meeting.findOne({ meetingCode });
    const meetingId = meeting ? meeting._id : null;
    const meetingTitle = meeting ? meeting.title : "a meeting";

    const assigner = await User.findById(assignerId);
    const assignerName = assigner ? assigner.name : "Someone";

    const notification = await Notification.create({
      recipient: assigneeId,
      sender: assignerId,
      type: "action_item",
      title: `New Action Item Assigned`,
      message: `${assignerName} assigned you an action item: "${actionText}" in "${meetingTitle}"`,
      relatedMeeting: meetingId,
    });

    const populatedNotification = await notification.populate("sender", "name email avatar");

    try {
      const io = getIO();
      io.to(`user:${assigneeId}`).emit("new-notification", populatedNotification);
    } catch (err) {
      console.warn("Socket.IO not ready/available during action item emit:", err.message);
    }
  } catch (error) {
    console.error("Error creating action item notification:", error);
  }
};
