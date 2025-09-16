import express from 'express';

import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { CALL_LOG_ROUTES } from '../Constants/call.routes';
import { CallController } from '../../Controllers/Call.controller';

const router = express.Router();
const callController = new CallController();
const authMiddleware = new AuthMiddleware();


router.get(CALL_LOG_ROUTES.getCallLogByUSerId, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], callController.getCallLogsByUserId.bind(callController));

export default router;