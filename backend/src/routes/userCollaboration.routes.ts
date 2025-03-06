import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import {
  authorize,
  checkBlockedStatus,
  verifyToken,
} from "../middlewares/auth.middleware.js";
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

//User - User Routes
router.post("/sendUser-User/:id",[apiLimiter, verifyToken, checkBlockedStatus],sendRequestController);
router.put("/respond/:connectionId",[apiLimiter, verifyToken, checkBlockedStatus],respondToRequestController);
router.put("/disconnect/:connectionId",[apiLimiter, verifyToken, checkBlockedStatus],disconnectConnectionController);
router.get("/connections/:userId",[apiLimiter, verifyToken, checkBlockedStatus],getUserConnectionsController);
router.get("/connections/:userId/requests",[apiLimiter, verifyToken, checkBlockedStatus],getUserRequestsController);
router.get("/getConnection/:connectionId",[apiLimiter, verifyToken, checkBlockedStatus], getUserConnectionByIdController);

//FOR ADMIN
router.get("/getAllconnection", [apiLimiter, verifyToken, authorize('admin')], getAllUserConnectionsController);

export default router;

