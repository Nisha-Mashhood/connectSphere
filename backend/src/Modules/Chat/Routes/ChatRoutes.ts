import { Router } from 'express';
import { ChatController } from '../Controllers/ChatController.js';
import { upload } from '../../../utils/multer.utils.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const chatController = new ChatController();

router.get('/chat/messages', [apiLimiter, verifyToken, checkBlockedStatus, authorize('user')], chatController.getChatMessages);
router.post('/chat/messages', [apiLimiter, verifyToken, checkBlockedStatus, authorize('user'), upload.single('file')], chatController.uploadAndSaveMessage);
router.get('/chat/unread', [apiLimiter, verifyToken, checkBlockedStatus, authorize('user')], chatController.getUnreadMessageCounts);

export default router;