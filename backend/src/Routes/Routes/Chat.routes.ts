import { Router } from 'express';
import { ChatController } from '../../Controllers/Chat.controller';
import { upload } from '../../Core/Utils/Multer';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { CHAT_ROUTES } from '../Constants/Chat.routes';

const router = Router();
const chatController = new ChatController();
const authMiddleware = new AuthMiddleware();

router.get(CHAT_ROUTES.GetMessages, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus ], chatController.getChatMessages);
router.post(CHAT_ROUTES.UploadMessage, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single('file')], chatController.uploadAndSaveMessage);
router.get(CHAT_ROUTES.GetUnreadCounts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getUnreadMessageCounts);

export default router;
