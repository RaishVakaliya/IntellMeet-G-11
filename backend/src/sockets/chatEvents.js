import { saveMessage } from "../controllers/chatController.js";
import { handleChatMentions } from "../services/notificationService.js";

export const registerChatEvents = (io, socket) => {
  socket.on(
    "send-message",
    async ({ meetingCode, message, senderId, senderName, senderAvatar }) => {
      console.log(
        `[Socket] Message from ${senderName} in room ${meetingCode}: ${message.substring(0, 20)}...`,
      );

      try {
        const success = await saveMessage(meetingCode, senderId, message);

        if (success) {
          console.log(
            `[Socket] Message persisted for room ${meetingCode}. Emitting...`,
          );
          io.to(meetingCode).emit("new-message", {
            content: message,
            sender: { _id: senderId, name: senderName, avatar: senderAvatar },
            timestamp: new Date(),
          });

          handleChatMentions(meetingCode, senderId, message);
        } else {
          console.error(
            `[Socket] saveMessage returned false for room ${meetingCode}`,
          );
        }
      } catch (error) {
        console.error(
          `[Socket] Error saving/emitting message for room ${meetingCode}:`,
          error,
        );
      }
    },
  );

  socket.on("typing", ({ meetingCode, userId, userName }) => {
    socket.to(meetingCode).emit("user-typing", { userId, userName });
  });

  socket.on("stop-typing", ({ meetingCode, userId }) => {
    socket.to(meetingCode).emit("user-stop-typing", { userId });
  });
};
