import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from "../core/Utils/Multer.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();
const authMiddleware = new AuthMiddleware();

router.post("/create-mentorprofile",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.array("certificates", 2)], MentorController.createMentor);
router.get('/check-mentor/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], MentorController.checkMentorStatus)
router.get("/getallmentorrequest",  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], MentorController.rejectMentorRequest);
router.put("/cancelmentorship/:mentorId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], MentorController.cancelMentorship);
router.get("/getmentorDetails/:mentorId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus,], MentorController.getMentorDetails);
router.put("/update-mentor/:mentorId",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus,], MentorController.updateMentorProfile )


router.get("/getAllMentors",[apiLimiter,authMiddleware.verifyToken,authMiddleware.checkBlockedStatus], MentorController.getAllMentors)

export default router;
