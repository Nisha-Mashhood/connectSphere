import { ITask, Task } from '../models/task.modal.js';

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

export const findTasksByContext = async (contextType: string, contextId: string): Promise<ITask[]> => {
  const tasks = await Task.find({
    $or: [
      { contextType, contextId }, 
      { assignedGroups: contextId }, 
      { assignedCollaborations: contextId } 
    ]
  }).populate('createdBy'); 

  return tasks;
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