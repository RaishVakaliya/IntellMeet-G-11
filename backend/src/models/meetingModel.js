import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["host", "member"],
          default: "member",
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],

    meetingCode: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "ended"],
      default: "scheduled",
    },

    startTime: Date,
    endTime: Date,

    recordingUrl: String,

    //   transcript: {
    //     type: String, // full text from AI transcription
    //   },

    //   summary: {
    //     type: String, // AI-generated summary
    //   },

    actionItems: [
      {
        text: String,
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    chatMessages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
