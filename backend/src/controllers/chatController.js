import { ChatMessage } from "../models/chatModel.js";

export const getChatHistory = async (req, res) => {
  try {
    const { code } = req.params;

    const messages = await ChatMessage.find({ meetingCode: code })
      .populate("sender", "name avatar")
      .sort({ timestamp: 1 })
      .lean();

    if (!messages)
      return res.status(404).json({ message: "No chat history found" });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

export const saveMessage = async (meetingCode, senderId, message) => {
  console.log(`[Mock Chat] Saved message to ${meetingCode}`);
  return true;
};
