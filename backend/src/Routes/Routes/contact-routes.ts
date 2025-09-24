import { Router } from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { CONTACT_ROUTES } from '../Constants/contact-routes';
import container from "../../container";
import { IContactController } from '../../Interfaces/Controller/i-contact-controller';

const router = Router();
const contactController = container.get<IContactController>('IContactController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');

router.get(CONTACT_ROUTES.GetUserContacts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactController.getUserContacts);

export default router;
