
import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
import { upload } from "../utils/multer.utils.js";
const router = express.Router();



// router.post("/submitmentorrequest", upload.array("certificates", 2), MentorController.submitMentorRequest);
router.post("/create-mentorprofile",upload.array("certificates", 2), MentorController.createMentor);
router.get('/get-allSkills',MentorController.getSkills)
router.get('/check-mentor/:id',MentorController.checkMentorStatus)
router.get("/getallmentorrequest", MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", MentorController.rejectMentorRequest);
router.put("/cancelmentorship/:mentorId", MentorController.cancelMentorship);

export default router;
