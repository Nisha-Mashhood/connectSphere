import { changeTaskPriorityService, changeTaskStatusService, createTaskService, deleteTaskService, editTaskService, getTasksByContextService } from "../services/task.service.js";
// import { sendTaskNotification } from "../services/notification.service.js";
export const createTask = async (req, res) => {
    const { id } = req.params;
    try {
        const imagePath = req.file?.path;
        const fileSize = req.file?.size;
        const taskData = JSON.parse(req.body.taskData);
        taskData.createdBy = id;
        const newTask = await createTaskService(taskData, imagePath, fileSize);
        res.status(201).json({ message: "Task created successfully", task: newTask });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
};
export const getTasksByContext = async (req, res) => {
    const { contextType, contextId } = req.params;
    try {
        const tasks = await getTasksByContextService(contextType, contextId);
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
export const updateTaskPriority = async (req, res) => {
    const { taskId } = req.params;
    const { priority } = req.body;
    try {
        const updatedTask = await changeTaskPriorityService(taskId, priority);
        res.status(200).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating priority', error: error.message });
    }
};
export const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = await changeTaskStatusService(taskId, status);
        res.status(200).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
export const editTask = async (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;
    try {
        const updatedTask = await editTaskService(taskId, updates);
        res.status(200).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: 'Error editing task', error: error.message });
    }
};
export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        await deleteTaskService(taskId);
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
};
//# sourceMappingURL=task.controller.js.map