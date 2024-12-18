import express from "express";
import * as MentorController from "../controllers/mentor.controller.js";
import { upload } from "../utils/multer.utils.js";
const router = express.Router();
router.post("/submitmentorrequest", upload.array("certificates", 2), MentorController.submitMentorRequest);
// router.post("/submitmentorrequest", MentorController.submitMentorRequest);
router.get("/getallmentorrequest", MentorController.getAllMentorRequests);
router.put("/approvementorrequest/:id", MentorController.approveMentorRequest);
router.delete("/rejectmentorrequest/:id", MentorController.rejectMentorRequest);
router.put("/updateavailableslots/:mentorId", MentorController.updateAvailableSlots);
export default router;
//# sourceMappingURL=mentor.routes.js.map