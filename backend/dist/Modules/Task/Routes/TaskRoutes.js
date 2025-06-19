import express from 'express';
import { TaskController } from '../Controllers/TaskController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
const router = express.Router();
const taskController = new TaskController();
const authMiddleware = new AuthMiddleware();
router.post('/createNewTask/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single('image')], taskController.createTask.bind(taskController));
router.get('/context/:contextType/:contextId/:userId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.getTasksByContext.bind(taskController));
router.patch('/updatePriority/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskPriority.bind(taskController));
router.patch('/updateStatus/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskStatus.bind(taskController));
router.put('/editTask/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.editTask.bind(taskController));
router.delete('/delete/:taskId', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.deleteTask.bind(taskController));
export default router;
//# sourceMappingURL=TaskRoutes.js.map