import { Request, Response } from 'express';
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
import { BaseController } from '../../../core/Controller/BaseController.js';
interface CategoryRequest extends Request {
    body: Partial<ICategory>;
    params: {
        id?: string;
    };
}
export declare class CategoryController extends BaseController {
    private categoryService;
    constructor();
    createCategory(req: CategoryRequest, res: Response): Promise<void>;
    getAllCategories(_req: Request, res: Response): Promise<void>;
    getCategoryById(req: CategoryRequest, res: Response): Promise<void>;
    updateCategory(req: CategoryRequest, res: Response): Promise<void>;
    deleteCategory(req: CategoryRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=CategoryController.d.ts.map