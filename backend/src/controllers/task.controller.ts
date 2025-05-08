import { Request, Response } from "express";
import { changeTaskPriorityService, changeTaskStatusService,  createTaskService,  deleteTaskService, editTaskService, getTasksByContextService } from "../services/task.service.js";
import { sendTaskNotification } from "../services/notification.service.js";


export const createTask = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const taskData = JSON.parse(req.body.taskData);
      taskData.createdBy = id;
      const newTask = await createTaskService(taskData, imagePath, fileSize);

      // Create notifications with scheduling
    const notifications = await sendTaskNotification(
      newTask._id.toString(),
      undefined,
      taskData.notificationDate,
      taskData.notificationTime
    );
    console.log(`Created ${notifications.length} notifications for task ${newTask._id}`);

      res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error creating task", error: error.message });
    }
};

export const getTasksByContext = async (req: Request, res: Response): Promise<void> => {
  const { contextType, contextId } = req.params;
  try {
    const tasks = await getTasksByContextService(contextType, contextId);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const updateTaskPriority = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { priority } = req.body;
  try {
    const updatedTask = await changeTaskPriorityService(taskId, priority);
    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating priority', error: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await changeTaskStatusService(taskId, status);
    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

export const editTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const updates = req.body;
  try {
    const updatedTask = await editTaskService(taskId, updates);
    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Error editing task', error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    await deleteTaskService(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};