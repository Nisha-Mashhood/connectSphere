import express from 'express';
import container from "../../container";
import { CONTACT_ROUTES } from '../Constants/ContactUs.routes';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { IContactMessageController } from '../../Interfaces/Controller/IContactUsController';
import { IAuthMiddleware } from '../../Interfaces/Middleware/IAuthMiddleware';

const router = express.Router();
const contactMessageController = container.get<IContactMessageController>('IContactMessageController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');

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