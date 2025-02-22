import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as user_userCollabController from '../controllers/user-userCollab.controller.js';
const router = express.Router();
//User - User Routes
router.post("/sendUser-User/:id", [apiLimiter, verifyToken, checkBlockedStatus], user_userCollabController.sendRequestController);
export default router;
//# sourceMappingURL=userCollaboration.routes.js.map