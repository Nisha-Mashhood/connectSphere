import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { getUserContactsController } from "../controllers/contact.controller.js";

const router = express.Router();
const authMiddleware = new AuthMiddleware();

router.get("/user", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], getUserContactsController);

export default router;