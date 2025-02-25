import { uploadImage } from '../utils/cloudinary.utils.js';
import { ITask } from '../models/task.modal.js';
import { createTaskRepo, deleteTask, editTask, findTasksByContext, updateTaskPriority, updateTaskStatus } from '../repositories/task.repositry.js';


 export const createTaskService = async(taskData: Partial<ITask>, imagePath?: string): Promise<ITask> => {
    if (imagePath) {
      const imageUrl = await uploadImage(imagePath, 'tasks');
      taskData.image = imageUrl;
    }
    return await createTaskRepo(taskData);
  }

  export const getTasksByContextService = async (contextType: string, contextId: string): Promise<ITask[]> => {
    return await findTasksByContext(contextType, contextId);
  };
  
  export const changeTaskPriorityService = async (taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null> => {
    return await updateTaskPriority(taskId, priority);
  };
  
  export const changeTaskStatusService = async (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null> => {
    return await updateTaskStatus(taskId, status);
  };
  
  export const editTaskService = async (taskId: string, updates: Partial<ITask>): Promise<ITask | null> => {
    return await editTask(taskId, updates);
  };

  export const deleteTaskService = async (taskId: string): Promise<void> => {
    await deleteTask(taskId);
  };