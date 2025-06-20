import { Request, Response } from 'express';
export declare class TaskController {
    private taskService;
    constructor();
    private toObjectId;
    createTask: (req: Request, res: Response) => Promise<void>;
    getTasksByContext: (req: Request, res: Response) => Promise<void>;
    updateTaskPriority: (req: Request, res: Response) => Promise<void>;
    updateTaskStatus: (req: Request, res: Response) => Promise<void>;
    editTask: (req: Request, res: Response) => Promise<void>;
    deleteTask: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=TaskController.d.ts.map