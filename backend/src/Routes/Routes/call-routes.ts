import express from 'express';

import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { CALL_LOG_ROUTES } from '../Constants/call-routes';
import container from '../../container';
import { ICallController } from '../../Interfaces/Controller/i-call-controller';

const router = express.Router();
const callController = container.get<ICallController>('ICallController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.get(CALL_LOG_ROUTES.getCallLogByUSerId, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], callController.getCallLogsByUserId.bind(callController));

export default router;