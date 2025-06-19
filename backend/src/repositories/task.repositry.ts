import { ITask } from '../Interfaces/models/ITask.js';
import { Task } from '../models/task.modal.js';

export const createTaskRepo = async (taskData: Partial<ITask>): Promise<ITask> => {
  const task = new Task(taskData);
  return await task.save();
}

export const findTaskById = async (taskId: string): Promise<ITask | null> => {
  return await Task.findById(taskId);
}

export const updateTask = async (taskId: string, updates: Partial<ITask>): Promise<ITask | null> => {
  return await Task.findByIdAndUpdate(taskId, updates, { new: true });
}

export const deleteTask = async (taskId: string): Promise<void> => {
  await Task.findByIdAndDelete(taskId);
}

export const findTasksByContext = async (contextType: string, contextId: string, userId: string): Promise<ITask[]> => {
  let query: any;
  let populatePaths: any[];

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
  } else {
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
}

export const updateTaskPriority = async (taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null> => {
  return await Task.findByIdAndUpdate(taskId, { priority }, { new: true });
}

export const updateTaskStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null> => {
  return await Task.findByIdAndUpdate(taskId, { status }, { new: true });
}

export const editTask = async (taskId: string, updates: Partial<ITask>): Promise<ITask | null> => {
  return await Task.findByIdAndUpdate(taskId, updates, { new: true });
}