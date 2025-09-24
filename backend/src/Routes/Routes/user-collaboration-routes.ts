import express from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { USER_CONNECTION_ROUTES } from '../Constants/user-collaboration-routes';
import container from "../../container";
import { IUserConnectionController } from '../../Interfaces/Controller/i-user-collaboration-controller';

const router = express.Router();
const userConnectionController = container.get<IUserConnectionController>('IUserConnectionController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(
  USER_CONNECTION_ROUTES.SendUserRequest,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.sendRequest.bind(userConnectionController)
);

router.put(
  USER_CONNECTION_ROUTES.RespondToRequest,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.respondToRequest.bind(userConnectionController)
);

router.put(
  USER_CONNECTION_ROUTES.DisconnectConnection,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.disconnectConnection.bind(userConnectionController)
);

router.get(
  USER_CONNECTION_ROUTES.GetUserConnections,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserConnections.bind(userConnectionController)
);

router.get(
  USER_CONNECTION_ROUTES.GetUserRequests,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserRequests.bind(userConnectionController)
);

router.get(
  USER_CONNECTION_ROUTES.GetConnectionById,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  userConnectionController.getUserConnectionById.bind(userConnectionController)
);

router.get(
  USER_CONNECTION_ROUTES.GetAllConnections,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  userConnectionController.getAllUserConnections.bind(userConnectionController)
);

export default router;