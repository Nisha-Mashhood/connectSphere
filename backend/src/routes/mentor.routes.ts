
import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from "../utils/multer.utils.js";
import { authorize, checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();



// router.post("/submitmentorrequest", upload.array("certificates", 2), MentorController.submitMentorRequest);
router.post("/create-mentorprofile",[apiLimiter, verifyToken, checkBlockedStatus, upload.array("certificates", 2)], MentorController.createMentor);
router.get('/get-allSkills', [apiLimiter, verifyToken, checkBlockedStatus], MentorController.getSkills)
router.get('/check-mentor/:id', [apiLimiter, verifyToken, checkBlockedStatus], MentorController.checkMentorStatus)
router.get("/getallmentorrequest",  [apiLimiter, verifyToken, authorize('admin')], MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", [apiLimiter, verifyToken, authorize('admin')], MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", [apiLimiter, verifyToken, authorize('admin')], MentorController.rejectMentorRequest);
router.put("/cancelmentorship/:mentorId", [apiLimiter, verifyToken, authorize('admin')], MentorController.cancelMentorship);

export default router;
