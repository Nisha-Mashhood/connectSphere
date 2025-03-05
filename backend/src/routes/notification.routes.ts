import express from "express";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/subscribe/:currentUserId", notificationController.subscribeToNotifications);

export default router;