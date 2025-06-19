import express from 'express';
import { UserConnectionController } from '../Controllers/userCollaborationController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { verifyToken, checkBlockedStatus, authorize } from '../../../middlewares/auth.middleware.js';

const router = express.Router();
const userConnectionController = new UserConnectionController();

router.post(
  '/sendUser-User/:id',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.sendRequest.bind(userConnectionController)
);

router.put(
  '/respond/:connectionId',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.respondToRequest.bind(userConnectionController)
);

router.put(
  '/disconnect/:connectionId',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.disconnectConnection.bind(userConnectionController)
);

router.get(
  '/connections/:userId',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.getUserConnections.bind(userConnectionController)
);

router.get(
  '/connections/:userId/requests',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.getUserRequests.bind(userConnectionController)
);

router.get(
  '/getConnection/:connectionId',
  [apiLimiter, verifyToken, checkBlockedStatus],
  userConnectionController.getUserConnectionById.bind(userConnectionController)
);

router.get(
  '/getAllconnection',
  [apiLimiter, verifyToken, authorize('admin')],
  userConnectionController.getAllUserConnections.bind(userConnectionController)
);

export default router;