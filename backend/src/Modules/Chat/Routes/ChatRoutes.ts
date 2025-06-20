import { Router } from 'express';
import { ChatController } from '../Controllers/ChatController.js';
import { upload } from '../../../core/Utils/Multer.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const chatController = new ChatController();
const authMiddleware = new AuthMiddleware();

router.get('/messages', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getChatMessages);
router.post('/upload', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user'), upload.single('file')], chatController.uploadAndSaveMessage);
router.get('/unread', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getUnreadMessageCounts);

export default router;
