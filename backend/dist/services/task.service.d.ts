import { ITask } from '../models/task.modal.js';
export declare const createTaskService: (taskData: Partial<ITask>, imagePath?: string) => Promise<ITask>;
export declare const getTasksByContextService: (contextType: string, contextId: string) => Promise<ITask[]>;
export declare const changeTaskPriorityService: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITask | null>;
export declare const changeTaskStatusService: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITask | null>;
export declare const editTaskService: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
//# sourceMappingURL=task.service.d.ts.map