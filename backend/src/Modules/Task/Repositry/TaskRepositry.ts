import { Model, Types, FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry';
import { RepositoryError } from '../../../core/Utils/ErrorHandler';
import logger from '../../../core/Utils/Logger';
import { ITask } from '../../../Interfaces/models/ITask';
import { Task } from '../../../models/task.modal';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task as Model<ITask>);
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

   createTask = async(taskData: Partial<ITask>): Promise<ITask> =>{
    try {
      logger.debug(`Creating task: ${taskData.name}`);
      return await this.create({
        ...taskData,
        contextId: taskData.contextId ? this.toObjectId(taskData.contextId) : undefined,
        createdBy: taskData.createdBy ? this.toObjectId(taskData.createdBy) : undefined,
        assignedUsers: taskData.assignedUsers
          ? taskData.assignedUsers.map((id) => this.toObjectId(id))
          : [],
        createdAt: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error creating task: ${error.message}`);
      throw new RepositoryError(`Error creating task: ${error.message}`);
    }
  }

   findTaskById = async(taskId: string): Promise<ITask | null> =>{
    try {
      logger.debug(`Fetching task by ID: ${taskId}`);
      return await this.findById(this.toObjectId(taskId).toString());
    } catch (error: any) {
      logger.error(`Error fetching task by ID: ${error.message}`);
      throw new RepositoryError(`Error fetching task by ID: ${error.message}`);
    }
  }

   updateTask = async(taskId: string, updates: Partial<ITask>): Promise<ITask | null> =>{
    try {
      logger.debug(`Updating task: ${taskId}`);
      const updateData = {
        ...updates,
        contextId: updates.contextId ? this.toObjectId(updates.contextId) : undefined,
        createdBy: updates.createdBy ? this.toObjectId(updates.createdBy) : undefined,
        assignedUsers: updates.assignedUsers
          ? updates.assignedUsers.map((id) => this.toObjectId(id))
          : undefined,
      };
      return await this.findByIdAndUpdate(this.toObjectId(taskId).toString(), updateData, { new: true });
    } catch (error: any) {
      logger.error(`Error updating task: ${error.message}`);
      throw new RepositoryError(`Error updating task: ${error.message}`);
    }
  }

   deleteTask = async(taskId: string): Promise<void> =>{
    try {
      logger.debug(`Deleting task: ${taskId}`);
      const result = await this.delete(this.toObjectId(taskId).toString());
      if (!result) {
        throw new RepositoryError('Task not found');
      }
    } catch (error: any) {
      logger.error(`Error deleting task: ${error.message}`);
      throw new RepositoryError(`Error deleting task: ${error.message}`);
    }
  }

   findTasksByContext = async(contextType: string, contextId: string, userId: string): Promise<ITask[] | null> =>{
    try {
      logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
      let query: FilterQuery<ITask>;
      let populatePaths: any[];

      if (contextType === 'profile' && userId) {
        query = {
          contextType: 'profile',
          $or: [
            { contextId: this.toObjectId(contextId) },
            { assignedUsers: this.toObjectId(userId) },
            { createdBy: this.toObjectId(userId) },
          ],
        };
        populatePaths = [
          { path: 'createdBy', model: 'User', select: 'name email jobTitle profilePic' },
          { path: 'assignedUsers', model: 'User', select: 'name email jobTitle profilePic' },
          { path: 'contextId', model: 'User', select: 'name email jobTitle profilePic' },
        ];
      } else {
        query = { contextType, contextId: this.toObjectId(contextId) };
        populatePaths = [
          { path: 'createdBy', model: 'User', select: 'name email jobTitle profilePic' },
          {
            path: 'contextId',
            model: contextType === 'group' ? 'Group' : 'Collaboration',
            populate: contextType === 'group' ? { path: 'members.userId', model: 'User', select: 'name email jobTitle profilePic' } : undefined,
          },
        ];
      }

      const tasks = await this.model
        .find(query)
        .populate(populatePaths)
        .sort({ createdAt: -1 })
        .exec();

      // Update status for tasks past due date
      const today = new Date();
      const updatedTasks = await Promise.all(
        tasks.map(async (task: ITask & ITask & { _id: Types.ObjectId }) => {
          if (task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed' && task.status !== 'not-completed') {
            logger.debug(`Updating status to not-completed for task: ${task.taskId} due to past due date: ${task.dueDate}`);
            const updatedTask = await this.model
              .findByIdAndUpdate(
                task._id,
                { status: 'not-completed' },
                { new: true }
              )
              .populate(populatePaths);
            return updatedTask ? updatedTask.toObject() : null;
          }
          return task.toObject();
        })
      );

      // Filter out null values to ensure ITask[]
      return updatedTasks.filter((task:any): task is ITask => task !== null);
    } catch (error: any) {
      logger.error(`Error fetching tasks by context: ${error.message}`);
      throw new RepositoryError(`Error fetching tasks by context: ${error.message}`);
    }
  }

   updateTaskPriority = async(taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null> =>{
    try {
      logger.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
      return await this.findByIdAndUpdate(this.toObjectId(taskId).toString(), { priority }, { new: true });
    } catch (error: any) {
      logger.error(`Error updating task priority: ${error.message}`);
      throw new RepositoryError(`Error updating task priority: ${error.message}`);
    }
  }

   updateTaskStatus = async(taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null> =>{
    try {
      logger.debug(`Updating task status: taskId=${taskId}, status=${status}`);
      return await this.findByIdAndUpdate(this.toObjectId(taskId).toString(), { status }, { new: true });
    } catch (error: any) {
      logger.error(`Error updating task status: ${error.message}`);
      throw new RepositoryError(`Error updating task status: ${error.message}`);
    }
  }
}