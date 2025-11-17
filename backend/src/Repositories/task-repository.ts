import { injectable } from 'inversify';
import { Model, Types, FilterQuery } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import { ITask } from '../Interfaces/Models/i-task';
import { Task } from '../Models/task-model';
import { StatusCodes } from '../enums/status-code-enums';
import { ITaskRepository } from '../Interfaces/Repository/i-task-repositry';
  
  @injectable()
  export class TaskRepository extends BaseRepository<ITask> implements ITaskRepository{
    constructor() {
      super(Task as Model<ITask>);
    }
  
    private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
      if (!id) {
        logger.warn('Missing ID when converting to ObjectId');
        throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
      }
      const idStr = typeof id === 'string' ? id : id.toString();
      if (!Types.ObjectId.isValid(idStr)) {
        logger.warn(`Invalid ObjectId format: ${idStr}`);
        throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
      }
      return new Types.ObjectId(idStr);
    }
  
    public createTask = async (taskData: Partial<ITask>): Promise<ITask> => {
      try {
        logger.debug(`Creating task: ${taskData.name}`);
        const task = await this.create({
          ...taskData,
          contextId: taskData.contextId ? this.toObjectId(taskData.contextId) : undefined,
          createdBy: taskData.createdBy ? this.toObjectId(taskData.createdBy) : undefined,
          assignedUsers: taskData.assignedUsers
            ? taskData.assignedUsers.map((id) => this.toObjectId(id))
            : [],
          createdAt: new Date(),
        });
        logger.info(`Task created: ${task._id} (${task.name})`);
        return task;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error creating task ${taskData.name}`, err);
        throw new RepositoryError('Error creating task', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public findTaskById = async (taskId: string): Promise<ITask | null> => {
      try {
        logger.debug(`Fetching task by ID: ${taskId}`);
        const task = await this.findById(taskId);
        if (!task) {
          logger.warn(`Task not found: ${taskId}`);
          throw new RepositoryError(`Task not found with ID: ${taskId}`, StatusCodes.NOT_FOUND);
        }
        logger.info(`Task fetched: ${taskId} (${task.name})`);
        return task;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error fetching task by ID ${taskId}`, err);
        throw new RepositoryError('Error fetching task by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public updateTask = async (taskId: string, updates: Partial<ITask>): Promise<ITask | null> => {
      try {
        logger.debug("🟠 REPO → Raw incoming updates: " + JSON.stringify({
          updates,
          assignedUsers: updates.assignedUsers
        }));
        const updateData = {
          ...updates,
          contextId: updates.contextId ? this.toObjectId(updates.contextId) : undefined,
          createdBy: updates.createdBy ? this.toObjectId(updates.createdBy) : undefined,
          assignedUsers: updates.assignedUsers !== undefined
          ? updates.assignedUsers.map((id) => this.toObjectId(id))
          : undefined,
        };
        const task = await this.findByIdAndUpdate(taskId, updateData, { new: true });
        if (!task) {
          logger.warn(`Task not found: ${taskId}`);
          throw new RepositoryError(`Task not found with ID: ${taskId}`, StatusCodes.NOT_FOUND);
        }
        logger.debug("🟠 REPO → Raw incoming updates: " + JSON.stringify({
          updates,
          assignedUsers: updates.assignedUsers
        }));
        logger.info(`Task updated: ${taskId} (${task.name})`);
        return task;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error updating task ${taskId}`, err);
        throw new RepositoryError('Error updating task', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public deleteTask = async (taskId: string): Promise<boolean | null> => {
      try {
        logger.debug(`Deleting task: ${taskId}`);
        const task = await this.findById(taskId);
        if (!task) {
          logger.warn(`Task not found: ${taskId}`);
          throw new RepositoryError(`Task not found with ID: ${taskId}`, StatusCodes.NOT_FOUND);
        }const result = await this.delete(taskId);
          if (!result) {
          throw new RepositoryError('Task not found');
          }
        logger.info(`Task deleted: ${taskId} (${task.name})`);
        return true;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error deleting task ${taskId}`, err);
        throw new RepositoryError('Error deleting task', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public findTasksByContext = async (contextType: string, contextId: string, userId: string): Promise<ITask[]> => {
      try {
        logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
        let query: FilterQuery<ITask>;
        let populatePaths: any[];
  
        if (contextType === 'user' && userId) {
          query = {
            contextType: 'user',
            $or: [
              { contextId: this.toObjectId(contextId) },
              { assignedUsers: this.toObjectId(userId) },
              { createdBy: this.toObjectId(userId) },
            ],
          };
          populatePaths = [
            { path: 'createdBy', model: 'User', select: '_id name email jobTitle profilePic' },
            { path: 'assignedUsers', model: 'User', select: '_id name email jobTitle profilePic' },
            { path: 'contextId', model: 'User', select: '_id name email jobTitle profilePic' },
          ];
        } else {
          query = { contextType, contextId: this.toObjectId(contextId) };
          populatePaths = [
            { path: 'createdBy', model: 'User', select: '_id name email jobTitle profilePic' },
            {
              path: 'contextId',
              model: contextType === 'group' ? 'Group' : 'Collaboration',
              populate: contextType === 'group' ? { path: 'members.userId', model: 'User', select: '_id name email jobTitle profilePic' } : undefined,
            },
          ];
        }
  
        const tasks = await this.model
          .find(query)
          .populate(populatePaths)
          .sort({ createdAt: -1 })
          .exec();
  
        const today = new Date();
        const updatedTasks = await Promise.all(
          tasks.map(async (task: ITask & { _id: Types.ObjectId }) => {
            if (task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed' && task.status !== 'not-completed') {
              logger.debug(`Updating status to not-completed for task: ${task._id} due to past due date: ${task.dueDate}`);
              const updatedTask = await this.model
                .findByIdAndUpdate(task._id, { status: 'not-completed' }, { new: true })
                .populate(populatePaths)
                .exec();
              if (!updatedTask) {
                logger.warn(`Failed to update task status for task: ${task._id}`);
                return null;
              }
              return updatedTask.toObject();
            }
            return task.toObject();
          })
        );
  
        const validTasks = updatedTasks.filter((task): task is ITask => {
          if (task === null) {
            logger.warn(`Null task encountered in findTasksByContext`);
            return false;
          }
          return true;
        });
  
        logger.info(`Fetched ${validTasks.length} tasks for contextType=${contextType}, contextId=${contextId}`);
        return validTasks;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error fetching tasks for contextType=${contextType}, contextId=${contextId}`, err);
        throw new RepositoryError('Error fetching tasks by context', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public updateTaskPriority = async (taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null> => {
      try {
        logger.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
        const task = await this.findByIdAndUpdate(taskId, { priority }, { new: true });
        if (!task) {
          logger.warn(`Task not found: ${taskId}`);
          throw new RepositoryError(`Task not found with ID: ${taskId}`, StatusCodes.NOT_FOUND);
        }
        logger.info(`Task priority updated: ${taskId} to ${priority}`);
        return task;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error updating task priority for task ${taskId}`, err);
        throw new RepositoryError('Error updating task priority', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public updateTaskStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null> => {
      try {
        logger.debug(`Updating task status: taskId=${taskId}, status=${status}`);
        const task = await this.findByIdAndUpdate(taskId, { status }, { new: true });
        if (!task) {
          logger.warn(`Task not found: ${taskId}`);
          throw new RepositoryError(`Task not found with ID: ${taskId}`, StatusCodes.NOT_FOUND);
        }
        logger.info(`Task status updated: ${taskId} to ${status}`);
        return task;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error updating task status for task ${taskId}`, err);
        throw new RepositoryError('Error updating task status', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  
    public isDuplicateTask = async (name: string, contextId: string, contextType: string): Promise<boolean> => {
      try {
        logger.debug(`Checking duplicate task: ${name} for contextId=${contextId}, contextType=${contextType}`);
        const existingTask = await this.model
          .findOne({ name, contextId: this.toObjectId(contextId), contextType })
          .exec();
        const isDuplicate = !!existingTask;
        logger.info(`Duplicate check for task ${name} in context ${contextId} (${contextType}) - ${isDuplicate}`);
        return isDuplicate;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error checking duplicate task ${name} for context ${contextId}`, err);
        throw new RepositoryError('Error checking duplicate task', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
  }