import express from 'express';
import { ContactMessageController } from '../Controllers/ContactUsController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { CONTACT_ROUTES } from '../Constant/ContactUs.routes.js';

const router = express.Router();
const contactMessageController = new ContactMessageController();
const authMiddleware = new AuthMiddleware();

router.post(
  CONTACT_ROUTES.CreateContactMessage,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  contactMessageController.createContactMessage.bind(contactMessageController)
);

router.get(
  CONTACT_ROUTES.GetAllContactMessages,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  contactMessageController.getAllContactMessages.bind(contactMessageController)
);

router.post(
  CONTACT_ROUTES.SendReply,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  contactMessageController.sendReply.bind(contactMessageController)
);

export default router;