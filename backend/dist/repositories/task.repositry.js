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
export const findTasksByContext = async (contextType, contextId, userId) => {
    let query;
    let populatePaths;
    if (contextType === "profile" && userId) {
        // Profile context: tasks where user is creator, assignee, or contextId matches
        query = {
            contextType: "profile",
            $or: [
                { contextId },
                { assignedUsers: userId },
                { createdBy: userId },
            ],
        };
        populatePaths = [
            { path: "createdBy", model: "User" },
            { path: "assignedUsers", model: "User" },
            { path: "contextId", model: "User" },
        ];
    }
    else {
        // Group or Collaboration context: tasks matching contextType and contextId
        query = { contextType, contextId };
        populatePaths = [
            { path: "createdBy", model: "User" },
            {
                path: "contextId",
                model: contextType === "group" ? "Group" : "Collaboration",
            },
        ];
    }
    return await Task.find(query)
        .populate(populatePaths)
        .sort({ createdAt: -1 });
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