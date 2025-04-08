import { uploadMedia } from '../utils/cloudinary.utils.js';
import { createTaskRepo, deleteTask, editTask, findTasksByContext, updateTaskPriority, updateTaskStatus } from '../repositories/task.repositry.js';
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
    return await editTask(taskId, updates);
};
export const deleteTaskService = async (taskId) => {
    await deleteTask(taskId);
};
//# sourceMappingURL=task.service.js.map