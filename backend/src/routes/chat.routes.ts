import express from "express";
import { getChatMessages, getUnreadMessageCounts, uploadAndSaveMessage } from "../controllers/chat.controller.js"; 
import { upload } from "../utils/multer.utils.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get chat messages for a contact or group
router.get("/messages",[apiLimiter, verifyToken, checkBlockedStatus], getChatMessages);

// Upload file and save message (for images/videos)
router.post("/upload", [apiLimiter, verifyToken, checkBlockedStatus, upload.single("file")],uploadAndSaveMessage);

//Get unread messages for a contact or group
router.get("/unread", [apiLimiter, verifyToken, checkBlockedStatus], getUnreadMessageCounts);

export default router;