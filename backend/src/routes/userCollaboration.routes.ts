import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import {
  disconnectConnectionController,
  getAllUserConnectionsController,
  getUserConnectionByIdController,
  getUserConnectionsController,
  getUserRequestsController,
  respondToRequestController,
  sendRequestController,
} from "../controllers/user-userCollab.controller.js";

const router = express.Router();
const authMiddleware = new AuthMiddleware();

//User - User Routes
router.post("/sendUser-User/:id",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],sendRequestController);
router.put("/respond/:connectionId",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],respondToRequestController);
router.put("/disconnect/:connectionId",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],disconnectConnectionController);
router.get("/connections/:userId",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],getUserConnectionsController);
router.get("/connections/:userId/requests",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],getUserRequestsController);
router.get("/getConnection/:connectionId",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], getUserConnectionByIdController);

//FOR ADMIN
router.get("/getAllconnection", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], getAllUserConnectionsController);

export default router;

