import { ITask } from '../Interfaces/models/ITask.js';
export declare const createTaskService: (taskData: Partial<ITask>, imagePath?: string, fileSize?: number) => Promise<ITask>;
export declare const getTasksByContextService: (contextType: string, contextId: string, userId: string) => Promise<ITask[]>;
export declare const changeTaskPriorityService: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITask | null>;
export declare const changeTaskStatusService: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITask | null>;
export declare const editTaskService: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
export declare const deleteTaskService: (taskId: string) => Promise<void>;
//# sourceMappingURL=task.service.d.ts.map