import { Router } from 'express';
import { ContactController } from '../Controllers/ContactController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { CONTACT_ROUTES } from '../Constant/Contact.routes.js';
const router = Router();
const contactController = new ContactController();
const authMiddleware = new AuthMiddleware();
router.get(CONTACT_ROUTES.GetUserContacts, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactController.getUserContacts);
export default router;
//# sourceMappingURL=ContactRoutes.js.map