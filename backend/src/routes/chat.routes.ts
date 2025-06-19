import express from "express";
import { getChatMessages, getUnreadMessageCounts, uploadAndSaveMessage } from "../controllers/chat.controller.js"; 
import { upload } from "../core/Utils/Multer.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();

// Get chat messages for a contact or group
router.get("/messages",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], getChatMessages);

// Upload file and save message (for images/videos)
router.post("/upload", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single("file")],uploadAndSaveMessage);

//Get unread messages for a contact or group
router.get("/unread", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], getUnreadMessageCounts);

export default router;