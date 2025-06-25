import { Router } from 'express';
import { ChatController } from '../Controllers/ChatController.js';
import { upload } from '../../../core/Utils/Multer.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { CHAT_ROUTES } from '../Constant/Chat.routes.js';
const router = Router();
const chatController = new ChatController();
const authMiddleware = new AuthMiddleware();
router.get(CHAT_ROUTES.GetMessages, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getChatMessages);
router.post(CHAT_ROUTES.UploadMessage, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user'), upload.single('file')], chatController.uploadAndSaveMessage);
router.get(CHAT_ROUTES.GetUnreadCounts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, authMiddleware.authorize('user')], chatController.getUnreadMessageCounts);
export default router;
//# sourceMappingURL=ChatRoutes.js.map