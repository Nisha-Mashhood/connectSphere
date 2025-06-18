import { Router } from 'express';
import { ContactController } from '../Controllers/ContactController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { verifyToken, checkBlockedStatus } from '../../../middlewares/auth.middleware.js';

const router = Router();
const contactController = new ContactController();

router.get('/contacts', [apiLimiter, verifyToken, checkBlockedStatus], contactController.getUserContacts);

export default router;