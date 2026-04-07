import { Meeting } from "../models/meetingModel.js";
import { nanoid } from "nanoid";
import redisClient from "../config/redis.js";

const CACHE_EXPIRATION = 3600;

export const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const meetingCode = nanoid(10);

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

    // Invalidate user's meeting list cache
    await redisClient.del(`user-meetings:${req.user._id}`);

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting" });
  }
};

export const getMyMeetings = async (req, res) => {
  try {
    const cacheKey = `user-meetings:${req.user._id}`;

    const cachedMeetings = await redisClient.get(cacheKey);
    if (cachedMeetings) {
      console.log(`Cache Hit for user-meetings: ${req.user._id}`);
      return res.status(200).json(JSON.parse(cachedMeetings));
    }

    const meetings = await Meeting.find({
      $or: [{ createdBy: req.user._id }, { "participants.user": req.user._id }],
    }).populate("createdBy", "name email avatar");

    await redisClient.setEx(
      cacheKey,
      CACHE_EXPIRATION,
      JSON.stringify(meetings),
    );
    console.log(`Cache Miss - Stored user-meetings: ${req.user._id}`);

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meetings" });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.body;
    if (!meetingCode) {
      return res.status(400).json({ message: "Meeting code is required" });
    }

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

      // Invalidate relevant caches
      await redisClient.del(`meeting:${meetingCode}`);
      await redisClient.del(`user-meetings:${req.user._id}`);
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error joining meeting" });
  }
};

export const getMeetingDetails = async (req, res) => {
  try {
    const { code } = req.params;

    const cachedMeeting = await redisClient.get(`meeting:${code}`);
    if (cachedMeeting) {
      console.log(`Cache Hit for meeting: ${code}`);
      return res.status(200).json(JSON.parse(cachedMeeting));
    }

    const meeting = await Meeting.findOne({ meetingCode: code })
      .populate("participants.user", "name email avatar")
      .populate("createdBy", "name email avatar");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await redisClient.setEx(
      `meeting:${code}`,
      CACHE_EXPIRATION,
      JSON.stringify(meeting),
    );
    console.log(`Cache Miss - Stored meeting: ${code}`);

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meeting details" });
  }
};
