import { Router } from 'express';
import { ContactController } from '../Controllers/ContactController';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { CONTACT_ROUTES } from '../Constant/Contact.routes';

const router = Router();
const contactController = new ContactController();
const authMiddleware = new AuthMiddleware();

router.get(CONTACT_ROUTES.GetUserContacts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactController.getUserContacts);

export default router;
