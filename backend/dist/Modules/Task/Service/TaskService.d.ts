import { BaseService } from '../../../core/Services/BaseService.js';
import { ITask } from '../../../Interfaces/models/ITask.js';
export declare class TaskService extends BaseService {
    private taskRepo;
    private notificationRepo;
    constructor();
    createTask: (taskData: Partial<ITask>, imagePath?: string, fileSize?: number) => Promise<ITask>;
    getTasksByContext: (contextType: string, contextId: string, userId: string) => Promise<ITask[]>;
    changeTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITask | null>;
    changeTaskStatus: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITask | null>;
    editTask: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
    deleteTask: (taskId: string) => Promise<void>;
}
//# sourceMappingURL=TaskService.d.ts.map