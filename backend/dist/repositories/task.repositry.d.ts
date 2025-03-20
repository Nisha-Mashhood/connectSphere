import { ITask } from '../models/task.modal.js';
export declare const createTaskRepo: (taskData: Partial<ITask>) => Promise<ITask>;
export declare const findTaskById: (taskId: string) => Promise<ITask | null>;
export declare const updateTask: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
export declare const deleteTask: (taskId: string) => Promise<void>;
export declare const findTasksByContext: (contextType: string, contextId: string) => Promise<ITask[]>;
export declare const updateTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITask | null>;
export declare const updateTaskStatus: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITask | null>;
export declare const editTask: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
//# sourceMappingURL=task.repositry.d.ts.map