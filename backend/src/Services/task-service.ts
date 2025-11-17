import { inject, injectable } from "inversify";
import { ServiceError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import { ITask } from "../Interfaces/Models/i-task";
import { uploadMedia } from "../core/utils/cloudinary";
import { StatusCodes } from "../enums/status-code-enums";
import { ITaskRepository } from "../Interfaces/Repository/i-task-repositry";
import { INotificationRepository } from "../Interfaces/Repository/i-notification-repositry";
import { ITaskService } from "../Interfaces/Services/i-task-service";
import { ITaskDTO } from "../Interfaces/DTOs/i-task-dto";
import { toTaskDTO, toTaskDTOs } from "../Utils/mappers/task-mapper";

@injectable()
export class TaskService  implements ITaskService{
  private _taskRepository: ITaskRepository;
  private _notificationRepository: INotificationRepository;

  constructor(
    @inject('ITaskRepository') taskRepository : ITaskRepository,
    @inject('INotificationRepository') notificationRepository : INotificationRepository
  ) {
    this._taskRepository = taskRepository;
    this._notificationRepository = notificationRepository;
  }

  public createTask = async (taskData: Partial<ITask>, imagePath?: string, fileSize?: number): Promise<ITaskDTO> => {
    try {
      logger.debug(`Creating task: ${taskData.name}`);

      if (!taskData.name || !taskData.createdBy || !taskData.contextType || !taskData.contextId) {
        logger.error("Missing required fields: name, createdBy, contextType, or contextId");
        throw new ServiceError(
          "Task name, createdBy, contextType, and contextId are required",
          StatusCodes.BAD_REQUEST
        );
      }
      const validContextTypes = ["collaboration", "group", "user"];
      if (!validContextTypes.includes(taskData.contextType)) {
        logger.error(`Invalid contextType: ${taskData.contextType}`);
        throw new ServiceError(
          `contextType must be one of: ${validContextTypes.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      let image: string | undefined;
      if (imagePath) {
        logger.debug(`Uploading image for task: ${taskData.name}`);
        const { url } = await uploadMedia(imagePath, "tasks", fileSize);
        image = url;
        logger.info(`Uploaded image for task: ${image}`);
      }

      const createdTask = await this._taskRepository.createTask({ ...taskData, image });
      const taskDTO = toTaskDTO(createdTask);
      if (!taskDTO) {
        logger.error(`Failed to map task ${createdTask._id} to DTO`);
        throw new ServiceError("Failed to map task to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(`Task created: ${createdTask._id} (${createdTask.name})`);
      return taskDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating task ${taskData.name}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create task",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getTasksByContext = async (contextType: string, contextId: string, userId: string): Promise<ITaskDTO[]> => {
    try {
      logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
      const validContextTypes = ["collaboration", "group", "user"];
      if (!validContextTypes.includes(contextType)) {
        logger.error(`Invalid contextType: ${contextType}`);
        throw new ServiceError(
          `contextType must be one of: ${validContextTypes.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const tasks = await this._taskRepository.findTasksByContext(contextType, contextId, userId);
      const taskDTOs = toTaskDTOs(tasks);
      logger.info(`Fetched ${taskDTOs.length} tasks for context: ${contextType}/${contextId}`);
      return taskDTOs;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching tasks for context ${contextType}/${contextId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch tasks by context",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public changeTaskPriority = async (taskId: string, priority: "low" | "medium" | "high"): Promise<ITaskDTO | null> => {
    try {
      logger.debug(`Changing task priority: taskId=${taskId}, priority=${priority}`);
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        logger.error(`Invalid priority: ${priority}`);
        throw new ServiceError(
          `Priority must be one of: ${validPriorities.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const task = await this._taskRepository.updateTaskPriority(taskId, priority);
      if (!task) {
        logger.warn(`Task not found: ${taskId}`);
        throw new ServiceError("Task not found", StatusCodes.NOT_FOUND);
      }

      const taskDTO = toTaskDTO(task);
      if (!taskDTO) {
        logger.error(`Failed to map task ${task._id} to DTO`);
        throw new ServiceError("Failed to map task to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(`Task priority changed: ${taskId} to ${priority}`);
      return taskDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error changing task priority for task ${taskId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to change task priority",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public changeTaskStatus = async (
    taskId: string,
    status: "pending" | "in-progress" | "completed" | "not-completed"
  ): Promise<ITaskDTO | null> => {
    try {
      logger.debug(`Changing task status: taskId=${taskId}, status=${status}`);
      const validStatuses = ["pending", "in-progress", "completed", "not-completed"];
      if (!validStatuses.includes(status)) {
        logger.error(`Invalid status: ${status}`);
        throw new ServiceError(
          `Status must be one of: ${validStatuses.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const task = await this._taskRepository.updateTaskStatus(taskId, status);
      if (!task) {
        logger.warn(`Task not found: ${taskId}`);
        throw new ServiceError("Task not found", StatusCodes.NOT_FOUND);
      }

      const taskDTO = toTaskDTO(task);
      if (!taskDTO) {
        logger.error(`Failed to map task ${task._id} to DTO`);
        throw new ServiceError("Failed to map task to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(`Task status changed: ${taskId} to ${status}`);
      return taskDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error changing task status for task ${taskId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to change task status",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public editTask = async (taskId: string, updates: Partial<ITask>): Promise<ITaskDTO | null> => {
    try {
      logger.debug(`Editing task: taskId=${taskId}`);

      const task = await this._taskRepository.updateTask(taskId, updates);
      if (!task) {
        logger.warn(`Task not found: ${taskId}`);
        throw new ServiceError("Task not found", StatusCodes.NOT_FOUND);
      }

      const taskDTO = toTaskDTO(task);
      if (!taskDTO) {
        logger.error(`Failed to map task ${task._id} to DTO`);
        throw new ServiceError("Failed to map task to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      if (updates.notificationDate || updates.notificationTime) {
        logger.debug(`Updating notifications for task: ${taskId}`);
        await this._notificationRepository.updateTaskNotifications(
          taskId,
          updates.notificationDate,
          updates.notificationTime
        );
        logger.info(`Updated notifications for task: ${taskId}`);
      }

      logger.info(`Task updated: ${taskId} (${task.name})`);
      return taskDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error editing task ${taskId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to edit task",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public deleteTask = async (taskId: string): Promise<void> => {
    try {
      logger.debug(`Deleting task: ${taskId}`);

      const task = await this._taskRepository.deleteTask(taskId);
      if (!task) {
        logger.warn(`Task not found: ${taskId}`);
        throw new ServiceError("Task not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Task deleted: ${taskId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting task ${taskId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to delete task",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}
