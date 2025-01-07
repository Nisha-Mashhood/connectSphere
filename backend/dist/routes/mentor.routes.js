import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
import { upload } from "../utils/multer.utils.js";
const router = express.Router();
router.get('/check-mentor/:id', MentorController.checkMentorStatus);
// router.post("/submitmentorrequest", upload.array("certificates", 2), MentorController.submitMentorRequest);
router.post("/create-mentorprofile", upload.array("certificates", 2), MentorController.createMentor);
router.get('/get-allSkills', MentorController.getSkills);
router.get("/getallmentorrequest", MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", MentorController.rejectMentorRequest);
export default router;
//# sourceMappingURL=mentor.routes.js.map