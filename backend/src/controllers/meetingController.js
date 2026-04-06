import { Meeting } from "../models/meetingModel.js";
import { nanoid } from "nanoid";

export const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const meetingCode = nanoid(10); // generate 10 char unique ID

    const meeting = await Meeting.create({
      title,
      description,
      startTime: startTime || new Date(),
      meetingCode,
      createdBy: req.user._id,
      participants: [
        { user: req.user._id, role: "host", joinedAt: new Date() },
      ],
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting" });
  }
};

export const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ createdBy: req.user._id }, { "participants.user": req.user._id }],
    }).populate("createdBy", "name email avatar");

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meetings" });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.body;
    const meeting = await Meeting.findOne({ meetingCode });

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (meeting.status === "ended")
      return res.status(400).json({ message: "Meeting already ended" });

    const isAlreadyParticipant = meeting.participants.some(
      (p) => p.user.toString() === req.user._id.toString(),
    );

    if (!isAlreadyParticipant) {
      meeting.participants.push({
        user: req.user._id,
        role: "member",
        joinedAt: new Date(),
      });
      await meeting.save();
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error joining meeting" });
  }
};

export const getMeetingDetails = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingCode: req.params.code })
      .populate("participants.user", "name email avatar")
      .populate("createdBy", "name email avatar");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meeting details" });
  }
};
