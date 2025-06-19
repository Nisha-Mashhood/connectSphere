import express from 'express';
import { UserConnectionController } from '../Controllers/userCollaborationController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = express.Router();
const userConnectionController = new UserConnectionController();
const authMiddleware = new AuthMiddleware();

router.post(
  '/sendUser-User/:id',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.sendRequest.bind(userConnectionController)
);

router.put(
  '/respond/:connectionId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.respondToRequest.bind(userConnectionController)
);

router.put(
  '/disconnect/:connectionId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.disconnectConnection.bind(userConnectionController)
);

router.get(
  '/connections/:userId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserConnections.bind(userConnectionController)
);

router.get(
  '/connections/:userId/requests',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserRequests.bind(userConnectionController)
);

router.get(
  '/getConnection/:connectionId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserConnectionById.bind(userConnectionController)
);

router.get(
  '/getAllconnection',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  userConnectionController.getAllUserConnections.bind(userConnectionController)
);

export default router;