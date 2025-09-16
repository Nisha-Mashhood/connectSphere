import express from 'express';
import { ContactMessageController } from '../../Controllers/ContactUs.controller';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { CONTACT_ROUTES } from '../Constants/ContactUs.routes';

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