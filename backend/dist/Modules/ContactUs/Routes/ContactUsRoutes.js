import express from 'express';
import { ContactMessageController } from '../Controllers/ContactUsController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
const router = express.Router();
const contactMessageController = new ContactMessageController();
const authMiddleware = new AuthMiddleware();
router.post('/contact', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactMessageController.createContactMessage.bind(contactMessageController));
router.get('/messages', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], contactMessageController.getAllContactMessages.bind(contactMessageController));
router.post('/reply/:contactMessageId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], contactMessageController.sendReply.bind(contactMessageController));
export default router;
//# sourceMappingURL=ContactUsRoutes.js.map