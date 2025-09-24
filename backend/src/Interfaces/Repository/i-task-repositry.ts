import { ITask } from '../Models/i-task';

export interface ITaskRepository {
  createTask(taskData: Partial<ITask>): Promise<ITask>;
  findTaskById(taskId: string): Promise<ITask | null>;
  updateTask(taskId: string, updates: Partial<ITask>): Promise<ITask | null>;
  deleteTask(taskId: string): Promise<boolean | null>;
  findTasksByContext(contextType: string, contextId: string, userId: string): Promise<ITask[]>;
  updateTaskPriority(taskId: string, priority: 'low' | 'medium' | 'high'): Promise<ITask | null>;
  updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'not-completed'): Promise<ITask | null>;
  isDuplicateTask(name: string, contextId: string, contextType: string): Promise<boolean>;
}