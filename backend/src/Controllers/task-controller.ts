import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { ITask } from '../Interfaces/Models/i-task';
import { Types } from 'mongoose';
import { ITaskController } from '../Interfaces/Controller/i-task-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from '../core/controller/base-controller';
import { ITaskService } from '../Interfaces/Services/i-task-service';
import { TASK_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class TaskController extends BaseController implements ITaskController{
  private _taskService: ITaskService;

  constructor(@inject('ITaskService') taskService : ITaskService) {
    super();
    this._taskService = taskService;
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new HttpError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(id)) {
      logger.error(`Invalid ID: ${id}`);
      throw new HttpError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(id);
  }

   createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const taskData: Partial<ITask> = req.body.taskData ? JSON.parse(req.body.taskData) : req.body;
      taskData.createdBy = this.toObjectId(id);
      logger.debug(`Creating task for user: ${id}, task: ${taskData.name}`);
      const newTask = await this._taskService.createTask(taskData, imagePath, fileSize);
      this.sendCreated(res, newTask, TASK_MESSAGES.TASK_CREATED);
    } catch (error: any) {
      logger.error(`Error creating task: ${error.message}`);
      next(error);
    }
  };

  getTasksByContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contextType, contextId, userId } = req.params;
      logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
      const tasks = await this._taskService.getTasksByContext(contextType, contextId, userId);

      const data = tasks.length === 0 ? [] : tasks;
      const message = tasks.length === 0 ? TASK_MESSAGES.NO_TASKS_FOUND : TASK_MESSAGES.TASKS_FETCHED;
      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error fetching tasks: ${error.message}`);
      next(error);
    }
  };

  updateTaskPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { priority } = req.body;
      logger.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
      const updatedTask = await this._taskService.changeTaskPriority(taskId, priority);
      if (!updatedTask) {
        throw new HttpError(ERROR_MESSAGES.TASK_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, updatedTask, TASK_MESSAGES.TASK_PRIORITY_UPDATED);
    } catch (error: any) {
      logger.error(`Error updating task priority: ${error.message}`);
      next(error);
    }
  };

  updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      logger.debug(`Updating task status: taskId=${taskId}, status=${status}`);
      const updatedTask = await this._taskService.changeTaskStatus(taskId, status);
      if (!updatedTask) {
        throw new HttpError(ERROR_MESSAGES.TASK_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, updatedTask, TASK_MESSAGES.TASK_STATUS_UPDATED);
    } catch (error: any) {
      logger.error(`Error updating task status: ${error.message}`);
      next(error);
    }
  };

  editTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const updates: Partial<ITask> =
      req.body.taskData ? JSON.parse(req.body.taskData) : req.body;

      logger.debug("🔵 CONTROLLER → Received task update: " + JSON.stringify({
        taskId,
        updates,
        assignedUsers: updates?.assignedUsers
      }));
      logger.debug(`Editing task: taskId=${taskId}`);
      const updatedTask = await this._taskService.editTask(taskId, updates);
      if (!updatedTask) {
        throw new HttpError(ERROR_MESSAGES.TASK_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, updatedTask, TASK_MESSAGES.TASK_UPDATED);
    } catch (error: any) {
      logger.error(`Error editing task: ${error.message}`);
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      logger.debug(`Deleting task: ${taskId}`);
      await this._taskService.deleteTask(taskId);
      this.sendSuccess(res, null, TASK_MESSAGES.TASK_DELETED);
    } catch (error: any) {
      logger.error(`Error deleting task: ${error.message}`);
      next(error);
    }
  };
}