import express from "express";
import { apiLimiter } from '../middlewares/ratelimit.middleware.js'
import { upload } from "../utils/multer.utils.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import { createTask, deleteTask, editTask, getTasksByContext, updateTaskPriority, updateTaskStatus } from "../controllers/task.controller.js";
const router = express.Router();

router.post("/createNewTask/:id",[apiLimiter, verifyToken,checkBlockedStatus, upload.single("image")], createTask);
router.get('/context/:contextType/:contextId', [apiLimiter, verifyToken,checkBlockedStatus], getTasksByContext);
router.patch('/updatePriority/:taskId', [apiLimiter, verifyToken,checkBlockedStatus], updateTaskPriority);
router.patch('/updateStatus/:taskId', [apiLimiter, verifyToken,checkBlockedStatus], updateTaskStatus);
router.put('/editTask/:taskId',[apiLimiter, verifyToken,checkBlockedStatus],  editTask);
router.delete('/delete/:taskId', [apiLimiter, verifyToken, checkBlockedStatus], deleteTask);

export default router;

