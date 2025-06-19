import { uploadMedia } from '../core/Utils/Cloudinary.js';
import { ITask } from '../Interfaces/models/ITask.js';
import { createTaskRepo, deleteTask, editTask, findTasksByContext, updateTaskPriority, updateTaskStatus } from '../repositories/task.repositry.js';
import { updateTaskNotifications } from '../repositories/notification.repositry.js';


 export const createTaskService = async(taskData: Partial<ITask>, imagePath?: string, fileSize?:number): Promise<ITask> => {
    if (imagePath) {
      const { url } =await uploadMedia(imagePath, 'tasks',fileSize);
      taskData.image = url;
    }
    return await createTaskRepo(taskData);
  }

  export const getTasksByContextService = async (contextType: string, contextId: string, userId: string): Promise<ITask[]> => {
    return await findTasksByContext(contextType, contextId, userId);
  };
  
  export const changeTaskPriorityService = async (taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null> => {
    return await updateTaskPriority(taskId, priority);
  };
  
  export const changeTaskStatusService = async (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null> => {
    return await updateTaskStatus(taskId, status);
  };
  
  export const editTaskService = async (taskId: string, updates: Partial<ITask>): Promise<ITask | null> => {
    // notificationDate and notificationTime is updated
  if (updates.notificationDate || updates.notificationTime) {
    const task = await editTask(taskId, updates);
    if (!task) {
      throw new Error('Task not found');
    }

    console.log(`notificationDate : ${updates.notificationDate} notification time : ${updates.notificationTime}`)
    // Update all notifications for this task
    await updateTaskNotifications(
      taskId,
      updates.notificationDate,
      updates.notificationTime
    );
    console.log(`Updated notifications for task ${taskId}`);

    return task;
  }

  return await editTask(taskId, updates);
};

  export const deleteTaskService = async (taskId: string): Promise<void> => {
    await deleteTask(taskId);
  };