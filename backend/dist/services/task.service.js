import { uploadImage } from '../utils/cloudinary.utils.js';
import { createTaskRepo, editTask, findTasksByContext, updateTaskPriority, updateTaskStatus } from '../repositories/task.repositry.js';
export const createTaskService = async (taskData, imagePath) => {
    if (imagePath) {
        const imageUrl = await uploadImage(imagePath, 'tasks');
        taskData.image = imageUrl;
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
//# sourceMappingURL=task.service.js.map