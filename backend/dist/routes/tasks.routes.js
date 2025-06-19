import express from "express";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { upload } from "../core/Utils/Multer.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { createTask, deleteTask, editTask, getTasksByContext, updateTaskPriority, updateTaskStatus } from "../controllers/task.controller.js";
const router = express.Router();
const authMiddleware = new AuthMiddleware();
router.post("/createNewTask/:id", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single("image")], createTask);
router.get('/context/:contextType/:contextId/:userId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], getTasksByContext);
router.patch('/updatePriority/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], updateTaskPriority);
router.patch('/updateStatus/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], updateTaskStatus);
router.put('/editTask/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], editTask);
router.delete('/delete/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], deleteTask);
export default router;
//# sourceMappingURL=tasks.routes.js.map