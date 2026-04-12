import express from "express";
import {
  createMeeting,
  endMeeting,
  getMyMeetings,
  joinMeeting,
  getMeetingDetails,
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//All meeting routes are protected
router.use(protect);

router.post("/create", createMeeting);
router.post("/join", joinMeeting);
router.patch("/:code/end", endMeeting);
router.get("/my-meetings", getMyMeetings);
router.get("/:code", getMeetingDetails);

export default router;
