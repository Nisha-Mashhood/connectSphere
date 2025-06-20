import { Router } from 'express';
import { ContactController } from '../Controllers/ContactController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();
const contactController = new ContactController();
const authMiddleware = new AuthMiddleware();

router.get('/user', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactController.getUserContacts);

export default router;
