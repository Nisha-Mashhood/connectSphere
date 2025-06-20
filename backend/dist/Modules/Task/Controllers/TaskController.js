import { TaskService } from '../Service/TaskService.js';
import logger from '../../../core/Utils/Logger.js';
import { Types } from 'mongoose';
export class TaskController {
    taskService;
    constructor() {
        this.taskService = new TaskService();
    }
    toObjectId(id) {
        if (!id) {
            logger.error('Missing ID');
            throw new Error('Invalid ID: ID is required');
        }
        if (!Types.ObjectId.isValid(id)) {
            logger.error(`Invalid ID: ${id}`);
            throw new Error('Invalid ID: must be a 24 character hex string');
        }
        return new Types.ObjectId(id);
    }
    createTask = async (req, res) => {
        try {
            const { id } = req.params;
            const imagePath = req.file?.path;
            const fileSize = req.file?.size;
            const taskData = req.body.taskData ? JSON.parse(req.body.taskData) : req.body;
            taskData.createdBy = this.toObjectId(id);
            logger.debug(`Creating task for user: ${id}, task: ${taskData.name}`);
            const newTask = await this.taskService.createTask(taskData, imagePath, fileSize);
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: newTask,
            });
        }
        catch (error) {
            logger.error(`Error creating task: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error creating task',
            });
        }
    };
    getTasksByContext = async (req, res) => {
        try {
            const { contextType, contextId, userId } = req.params;
            logger.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
            const tasks = await this.taskService.getTasksByContext(contextType, contextId, userId);
            res.status(200).json({
                success: true,
                message: 'Tasks fetched successfully',
                data: tasks,
            });
        }
        catch (error) {
            logger.error(`Error fetching tasks: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching tasks',
            });
        }
    };
    updateTaskPriority = async (req, res) => {
        try {
            const { taskId } = req.params;
            const { priority } = req.body;
            logger.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
            const updatedTask = await this.taskService.changeTaskPriority(taskId, priority);
            if (!updatedTask) {
                throw new Error('Task not found');
            }
            res.status(200).json({
                success: true,
                message: 'Task priority updated successfully',
                data: updatedTask,
            });
        }
        catch (error) {
            logger.error(`Error updating task priority: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error updating task priority',
            });
        }
    };
    updateTaskStatus = async (req, res) => {
        try {
            const { taskId } = req.params;
            const { status } = req.body;
            logger.debug(`Updating task status: taskId=${taskId}, status=${status}`);
            const updatedTask = await this.taskService.changeTaskStatus(taskId, status);
            if (!updatedTask) {
                throw new Error('Task not found');
            }
            res.status(200).json({
                success: true,
                message: 'Task status updated successfully',
                data: updatedTask,
            });
        }
        catch (error) {
            logger.error(`Error updating task status: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error updating task status',
            });
        }
    };
    editTask = async (req, res) => {
        try {
            const { taskId } = req.params;
            const updates = req.body;
            logger.debug(`Editing task: taskId=${taskId}`);
            const updatedTask = await this.taskService.editTask(taskId, updates);
            if (!updatedTask) {
                throw new Error('Task not found');
            }
            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: updatedTask,
            });
        }
        catch (error) {
            logger.error(`Error editing task: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error editing task',
            });
        }
    };
    deleteTask = async (req, res) => {
        try {
            const { taskId } = req.params;
            logger.debug(`Deleting task: ${taskId}`);
            await this.taskService.deleteTask(taskId);
            res.status(200).json({
                success: true,
                message: 'Task deleted successfully',
                data: null,
            });
        }
        catch (error) {
            logger.error(`Error deleting task: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error deleting task',
            });
        }
    };
}
//# sourceMappingURL=TaskController.js.map