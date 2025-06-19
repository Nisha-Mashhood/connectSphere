import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { Task } from '../../../models/task.modal.js';
export class TaskRepository extends BaseRepository {
    constructor() {
        super(Task);
    }
    toObjectId(id) {
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
    async createTask(taskData) {
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
        }
        catch (error) {
            logger.error(`Error creating task: ${error.message}`);
            throw new RepositoryError(`Error creating task: ${error.message}`);
        }
    }
    async findTaskById(taskId) {
        try {
            logger.debug(`Fetching task by ID: ${taskId}`);
            return await this.findById(this.toObjectId(taskId).toString());
        }
        catch (error) {
            logger.error(`Error fetching task by ID: ${error.message}`);
            throw new RepositoryError(`Error fetching task by ID: ${error.message}`);
        }
    }
    async updateTask(taskId, updates) {
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
        }
        catch (error) {
            logger.error(`Error updating task: ${error.message}`);
            throw new RepositoryError(`Error updating task: ${error.message}`);
        }
    }
    async deleteTask(taskId) {
        try {
            logger.debug(`Deleting task: ${taskId}`);
            const result = await this.delete(this.toObjectId(taskId).toString());
            if (!result) {
                throw new RepositoryError('Task not found');
            }
        }
        catch (error) {
            logger.error(`Error deleting task: ${error.message}`);
            throw new RepositoryError(`Error deleting task: ${error.message}`);
        }
    }
    async findTasksByContext(contextType, contextId, userId) {
        try {
            logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
            let query;
            let populatePaths;
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
            }
            else {
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
            return await this.model
                .find(query)
                .populate(populatePaths)
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching tasks by context: ${error.message}`);
            throw new RepositoryError(`Error fetching tasks by context: ${error.message}`);
        }
    }
    async updateTaskPriority(taskId, priority) {
        try {
            logger.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
            return await this.findByIdAndUpdate(this.toObjectId(taskId).toString(), { priority }, { new: true });
        }
        catch (error) {
            logger.error(`Error updating task priority: ${error.message}`);
            throw new RepositoryError(`Error updating task priority: ${error.message}`);
        }
    }
    async updateTaskStatus(taskId, status) {
        try {
            logger.debug(`Updating task status: taskId=${taskId}, status=${status}`);
            return await this.findByIdAndUpdate(this.toObjectId(taskId).toString(), { status }, { new: true });
        }
        catch (error) {
            logger.error(`Error updating task status: ${error.message}`);
            throw new RepositoryError(`Error updating task status: ${error.message}`);
        }
    }
}
//# sourceMappingURL=TaskRepositry.js.map