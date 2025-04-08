import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { verifyToken, checkBlockedStatus } from "../middlewares/auth.middleware.js";
import { getUserContactsController } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/user", [apiLimiter, verifyToken, checkBlockedStatus], getUserContactsController);

export default router;