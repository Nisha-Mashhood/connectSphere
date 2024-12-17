
import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
const router = express.Router();

router.post("/submitmentorrequest", MentorController.submitMentorRequest);
router.get("/getallmentorrequest", MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", MentorController.rejectMentorRequest);

export default router;