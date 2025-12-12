import { Router } from 'express';
import container from "../../container";
import { CHAT_ROUTES } from '../Constants/chat-routes';
import { IChatController } from '../../Interfaces/Controller/i-chat-controller';
import { upload } from '../../core/utils/multer';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';

const router = Router();
const chatController = container.get<IChatController>('IChatController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');

router.get(CHAT_ROUTES.GetMessages, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus ], chatController.getChatMessages);
router.post(CHAT_ROUTES.UploadMessage, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single('file')], chatController.uploadAndSaveMessage);
router.get(CHAT_ROUTES.GetUnreadCounts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getUnreadMessageCounts);
router.get(CHAT_ROUTES.GetLastMessages, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getLastMessageSummaries);

export default router;
