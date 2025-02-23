import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import {
  checkBlockedStatus,
  verifyToken,
} from "../middlewares/auth.middleware.js";
import {
  disconnectConnectionController,
  getUserConnectionsController,
  getUserRequestsController,
  respondToRequestController,
  sendRequestController,
} from "../controllers/user-userCollab.controller.js";

const router = express.Router();

//User - User Routes
router.post(
  "/sendUser-User/:id",
  [apiLimiter, verifyToken, checkBlockedStatus],
  sendRequestController
);
router.put(
  "/respond/:connectionId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  respondToRequestController
);
router.put(
  "/disconnect/:connectionId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  disconnectConnectionController
);
router.get(
  "/connections/:userId",
  [apiLimiter, verifyToken, checkBlockedStatus],
  getUserConnectionsController
);
router.get(
  "/connections/:userId/requests",
  [apiLimiter, verifyToken, checkBlockedStatus],
  getUserRequestsController
);

export default router;
