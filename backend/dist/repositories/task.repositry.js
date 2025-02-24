import { Task } from '../models/task.modal.js';
export const createTaskRepo = async (taskData) => {
    const task = new Task(taskData);
    return await task.save();
};
export const findTaskById = async (taskId) => {
    return await Task.findById(taskId);
};
export const updateTask = async (taskId, updates) => {
    return await Task.findByIdAndUpdate(taskId, updates, { new: true });
};
export const deleteTask = async (taskId) => {
    await Task.findByIdAndDelete(taskId);
};
export const findTasksByContext = async (contextType, contextId) => {
    return await Task.find({ contextType, contextId });
};
export const updateTaskPriority = async (taskId, priority) => {
    return await Task.findByIdAndUpdate(taskId, { priority }, { new: true });
};
export const updateTaskStatus = async (taskId, status) => {
    return await Task.findByIdAndUpdate(taskId, { status }, { new: true });
};
export const editTask = async (taskId, updates) => {
    return await Task.findByIdAndUpdate(taskId, updates, { new: true });
};
//# sourceMappingURL=task.repositry.js.map