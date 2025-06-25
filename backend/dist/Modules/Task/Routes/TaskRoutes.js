import express from 'express';
import { TaskController } from '../Controllers/TaskController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
import { TASK_ROUTES } from '../Constant/Task.routes.js';
const router = express.Router();
const taskController = new TaskController();
const authMiddleware = new AuthMiddleware();
router.post(TASK_ROUTES.CreateTask, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single('image')], taskController.createTask.bind(taskController));
router.get(TASK_ROUTES.GetTasksByContext, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.getTasksByContext.bind(taskController));
router.patch(TASK_ROUTES.UpdateTaskPriority, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskPriority.bind(taskController));
router.patch(TASK_ROUTES.UpdateTaskStatus, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskStatus.bind(taskController));
router.put(TASK_ROUTES.EditTask, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.editTask.bind(taskController));
router.delete(TASK_ROUTES.DeleteTask, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.deleteTask.bind(taskController));
export default router;
//# sourceMappingURL=TaskRoutes.js.map