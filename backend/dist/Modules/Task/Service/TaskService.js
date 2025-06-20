import { BaseService } from '../../../core/Services/BaseService.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { TaskRepository } from '../Repositry/TaskRepositry.js';
import { NotificationRepository } from '../../Notification/Repositry/NotificationRepositry.js';
import { uploadMedia } from '../../../core/Utils/Cloudinary.js';
export class TaskService extends BaseService {
    taskRepo;
    notificationRepo;
    constructor() {
        super();
        this.taskRepo = new TaskRepository();
        this.notificationRepo = new NotificationRepository();
    }
    createTask = async (taskData, imagePath, fileSize) => {
        try {
            logger.debug(`Creating task: ${taskData.name}`);
            this.checkData(taskData);
            if (!taskData.createdBy || !taskData.contextType || !taskData.contextId) {
                logger.error('Missing required fields: createdBy, contextType, or contextId');
                throw new ServiceError('Missing required fields: createdBy, contextType, or contextId');
            }
            if (imagePath) {
                logger.debug(`Uploading image for task: ${taskData.name}`);
                const { url } = await uploadMedia(imagePath, 'tasks', fileSize);
                taskData.image = url;
            }
            return await this.taskRepo.createTask(taskData);
        }
        catch (error) {
            logger.error(`Error creating task: ${error.message}`);
            throw new ServiceError(`Error creating task: ${error.message}`);
        }
    };
    getTasksByContext = async (contextType, contextId, userId) => {
        try {
            logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
            this.checkData({ contextType, contextId, userId });
            return await this.taskRepo.findTasksByContext(contextType, contextId, userId);
        }
        catch (error) {
            logger.error(`Error fetching tasks by context: ${error.message}`);
            throw new ServiceError(`Error fetching tasks by context: ${error.message}`);
        }
    };
    changeTaskPriority = async (taskId, priority) => {
        try {
            logger.debug(`Changing task priority: taskId=${taskId}, priority=${priority}`);
            this.checkData({ taskId, priority });
            return await this.taskRepo.updateTaskPriority(taskId, priority);
        }
        catch (error) {
            logger.error(`Error changing task priority: ${error.message}`);
            throw new ServiceError(`Error changing task priority: ${error.message}`);
        }
    };
    changeTaskStatus = async (taskId, status) => {
        try {
            logger.debug(`Changing task status: taskId=${taskId}, status=${status}`);
            this.checkData({ taskId, status });
            return await this.taskRepo.updateTaskStatus(taskId, status);
        }
        catch (error) {
            logger.error(`Error changing task status: ${error.message}`);
            throw new ServiceError(`Error changing task status: ${error.message}`);
        }
    };
    editTask = async (taskId, updates) => {
        try {
            logger.debug(`Editing task: taskId=${taskId}`);
            this.checkData({ taskId, updates });
            const task = await this.taskRepo.updateTask(taskId, updates);
            if (!task) {
                logger.error(`Task not found: taskId=${taskId}`);
                throw new ServiceError('Task not found');
            }
            if (updates.notificationDate || updates.notificationTime) {
                logger.debug(`Updating notifications for task: ${taskId}`);
                await this.notificationRepo.updateTaskNotifications(taskId, updates.notificationDate, updates.notificationTime);
                logger.info(`Updated notifications for task ${taskId}`);
            }
            return task;
        }
        catch (error) {
            logger.error(`Error editing task: ${error.message}`);
            throw new ServiceError(`Error editing task: ${error.message}`);
        }
    };
    deleteTask = async (taskId) => {
        try {
            logger.debug(`Deleting task: ${taskId}`);
            this.checkData(taskId);
            await this.taskRepo.deleteTask(taskId);
        }
        catch (error) {
            logger.error(`Error deleting task: ${error.message}`);
            throw new ServiceError(`Error deleting task: ${error.message}`);
        }
    };
}
//# sourceMappingURL=TaskService.js.map