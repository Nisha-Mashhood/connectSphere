import { Router } from 'express';
import { ChatController } from '../Controllers/ChatController.js';
import { upload } from '../../../core/Utils/Multer.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const chatController = new ChatController();
const authMiddleware = new AuthMiddleware();

router.get('/chat/messages', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getChatMessages);
router.post('/chat/messages', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user'), upload.single('file')], chatController.uploadAndSaveMessage);
router.get('/chat/unread', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getUnreadMessageCounts);

export default router;