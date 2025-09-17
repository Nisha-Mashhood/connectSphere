import express from 'express';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/IAuthMiddleware';
import { upload } from '../../Core/Utils/Multer';
import { TASK_ROUTES } from '../Constants/Task.routes';
import container from "../../container";
import { ITaskController } from '../../Interfaces/Controller/ITaskController';

const router = express.Router();
const taskController = container.get<ITaskController>('ITaskController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


router.post(
  TASK_ROUTES.CreateTask,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.single('image')],
  taskController.createTask.bind(taskController)
);

router.get(
  TASK_ROUTES.GetTasksByContext,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  taskController.getTasksByContext.bind(taskController)
);

router.patch(
  TASK_ROUTES.UpdateTaskPriority,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  taskController.updateTaskPriority.bind(taskController)
);

router.patch(
  TASK_ROUTES.UpdateTaskStatus,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  taskController.updateTaskStatus.bind(taskController)
);

router.put(
 TASK_ROUTES.EditTask,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  taskController.editTask.bind(taskController)
);

router.delete(
  TASK_ROUTES.DeleteTask,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  taskController.deleteTask.bind(taskController)
);

export default router;