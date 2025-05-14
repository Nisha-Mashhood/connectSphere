import { uploadMedia } from '../utils/cloudinary.utils.js';
import { createTaskRepo, deleteTask, editTask, findTasksByContext, updateTaskPriority, updateTaskStatus } from '../repositories/task.repositry.js';
import { updateTaskNotifications } from '../repositories/notification.repositry.js';
export const createTaskService = async (taskData, imagePath, fileSize) => {
    if (imagePath) {
        const { url } = await uploadMedia(imagePath, 'tasks', fileSize);
        taskData.image = url;
    }
    return await createTaskRepo(taskData);
};
export const getTasksByContextService = async (contextType, contextId) => {
    return await findTasksByContext(contextType, contextId);
};
export const changeTaskPriorityService = async (taskId, priority) => {
    return await updateTaskPriority(taskId, priority);
};
export const changeTaskStatusService = async (taskId, status) => {
    return await updateTaskStatus(taskId, status);
};
export const editTaskService = async (taskId, updates) => {
    // notificationDate and notificationTime is updated
    if (updates.notificationDate || updates.notificationTime) {
        const task = await editTask(taskId, updates);
        if (!task) {
            throw new Error('Task not found');
        }
        console.log(`notificationDate : ${updates.notificationDate} notification time : ${updates.notificationTime}`);
        // Update all notifications for this task
        await updateTaskNotifications(taskId, updates.notificationDate, updates.notificationTime);
        console.log(`Updated notifications for task ${taskId}`);
        return task;
    }
    return await editTask(taskId, updates);
};
export const deleteTaskService = async (taskId) => {
    await deleteTask(taskId);
};
//# sourceMappingURL=task.service.js.map