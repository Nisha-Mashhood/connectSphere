import { ITask } from "../Models/i-task";
import { ITaskDTO } from "../DTOs/i-task-dto";

export interface ITaskService {
  createTask: (taskData: Partial<ITask>, imagePath?: string, fileSize?: number) => Promise<ITaskDTO>;
  getTasksByContext: (contextType: string, contextId: string, userId: string) => Promise<ITaskDTO[]>;
  changeTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITaskDTO | null>;
  changeTaskStatus: (
    taskId: string,
    status: "pending" | "in-progress" | "completed" | "not-completed"
  ) => Promise<ITaskDTO | null>;
  editTask: (taskId: string, updates: Partial<ITask>) => Promise<ITaskDTO | null>;
  deleteTask: (taskId: string) => Promise<void>;
}