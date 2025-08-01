import { BaseService } from "../../../core/Services/BaseService";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import { TaskRepository } from "../Repositry/TaskRepositry";
import { NotificationRepository } from "../../Notification/Repositry/NotificationRepositry";
import { ITask } from "../../../Interfaces/models/ITask";
import { uploadMedia } from "../../../core/Utils/Cloudinary";

export class TaskService extends BaseService {
  private taskRepo: TaskRepository;
  private notificationRepo: NotificationRepository;

  constructor() {
    super();
    this.taskRepo = new TaskRepository();
    this.notificationRepo = new NotificationRepository();
  }

  createTask = async (
    taskData: Partial<ITask>,
    imagePath?: string,
    fileSize?: number
  ): Promise<ITask> => {
    try {
      logger.debug(`Creating task: ${taskData.name}`);
      this.checkData(taskData);

      if (!taskData.createdBy || !taskData.contextType || !taskData.contextId) {
        logger.error(
          "Missing required fields: createdBy, contextType, or contextId"
        );
        throw new ServiceError(
          "Missing required fields: createdBy, contextType, or contextId"
        );
      }

      if (imagePath) {
        logger.debug(`Uploading image for task: ${taskData.name}`);
        const { url } = await uploadMedia(imagePath, "tasks", fileSize);
        taskData.image = url;
      }

      const createdTask = await this.taskRepo.createTask(taskData);
      return createdTask;
    } catch (error: any) {
      logger.error(`Error creating task: ${error.message}`);
      throw new ServiceError(`Error creating task: ${error.message}`);
    }
  };

  getTasksByContext = async (
    contextType: string,
    contextId: string,
    userId: string
  ): Promise<ITask[] | null> => {
    try {
      logger.debug(
        `Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`
      );
      this.checkData({ contextType, contextId, userId });
      return await this.taskRepo.findTasksByContext(
        contextType,
        contextId,
        userId
      );
    } catch (error: any) {
      logger.error(`Error fetching tasks by context: ${error.message}`);
      throw new ServiceError(
        `Error fetching tasks by context: ${error.message}`
      );
    }
  };

  changeTaskPriority = async (
    taskId: string,
    priority: "low" | "medium" | "high"
  ): Promise<ITask | null> => {
    try {
      logger.debug(
        `Changing task priority: taskId=${taskId}, priority=${priority}`
      );
      this.checkData({ taskId, priority });
      return await this.taskRepo.updateTaskPriority(taskId, priority);
    } catch (error: any) {
      logger.error(`Error changing task priority: ${error.message}`);
      throw new ServiceError(`Error changing task priority: ${error.message}`);
    }
  };

  changeTaskStatus = async (
    taskId: string,
    status: "pending" | "in-progress" | "completed" | "not-completed"
  ): Promise<ITask | null> => {
    try {
      logger.debug(`Changing task status: taskId=${taskId}, status=${status}`);
      this.checkData({ taskId, status });
      return await this.taskRepo.updateTaskStatus(taskId, status);
    } catch (error: any) {
      logger.error(`Error changing task status: ${error.message}`);
      throw new ServiceError(`Error changing task status: ${error.message}`);
    }
  };

  editTask = async (
    taskId: string,
    updates: Partial<ITask>
  ): Promise<ITask | null> => {
    try {
      logger.debug(`Editing task: taskId=${taskId}`);
      this.checkData({ taskId, updates });

      const task = await this.taskRepo.updateTask(taskId, updates);
      if (!task) {
        logger.error(`Task not found: taskId=${taskId}`);
        throw new ServiceError("Task not found");
      }

      if (updates.notificationDate || updates.notificationTime) {
        logger.debug(`Updating notifications for task: ${taskId}`);
        await this.notificationRepo.updateTaskNotifications(
          taskId,
          updates.notificationDate,
          updates.notificationTime
        );
        logger.info(`Updated notifications for task ${taskId}`);
      }

      return task;
    } catch (error: any) {
      logger.error(`Error editing task: ${error.message}`);
      throw new ServiceError(`Error editing task: ${error.message}`);
    }
  };

  deleteTask = async (taskId: string): Promise<void> => {
    try {
      logger.debug(`Deleting task: ${taskId}`);
      this.checkData(taskId);
      await this.taskRepo.deleteTask(taskId);
    } catch (error: any) {
      logger.error(`Error deleting task: ${error.message}`);
      throw new ServiceError(`Error deleting task: ${error.message}`);
    }
  };
}
