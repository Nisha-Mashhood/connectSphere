import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
import { CategoryRequest } from '../Types/types.js';
export declare class CategoryController extends BaseController {
    private categoryService;
    constructor();
    createCategory: (req: CategoryRequest, res: Response) => Promise<void>;
    getAllCategories: (_req: Request, res: Response) => Promise<void>;
    getCategoryById: (req: CategoryRequest, res: Response) => Promise<void>;
    updateCategory: (req: CategoryRequest, res: Response) => Promise<void>;
    deleteCategory: (req: CategoryRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=CategoryController.d.ts.map