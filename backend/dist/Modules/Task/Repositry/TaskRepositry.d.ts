import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { ITask } from '../../../Interfaces/models/ITask.js';
export declare class TaskRepository extends BaseRepository<ITask> {
    constructor();
    private toObjectId;
    createTask: (taskData: Partial<ITask>) => Promise<ITask>;
    findTaskById: (taskId: string) => Promise<ITask | null>;
    updateTask: (taskId: string, updates: Partial<ITask>) => Promise<ITask | null>;
    deleteTask: (taskId: string) => Promise<void>;
    findTasksByContext: (contextType: string, contextId: string, userId: string) => Promise<ITask[]>;
    updateTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITask | null>;
    updateTaskStatus: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITask | null>;
}
//# sourceMappingURL=TaskRepositry.d.ts.map