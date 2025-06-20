import { Request, Response } from 'express';
import { SubcategoryInterface as ISubcategory } from "../../../Interfaces/models/SubcategoryInterface.js";
import { BaseController } from '../../../core/Controller/BaseController.js';
interface SubcategoryRequest extends Request {
    body: Partial<ISubcategory>;
    params: {
        id?: string;
        categoryId?: string;
    };
}
export declare class SubcategoryController extends BaseController {
    private subcategoryService;
    private subcategoryRepo;
    constructor();
    createSubcategory: (req: SubcategoryRequest, res: Response) => Promise<void>;
    getAllSubcategories: (req: SubcategoryRequest, res: Response) => Promise<void>;
    getSubcategoryById: (req: SubcategoryRequest, res: Response) => Promise<void>;
    updateSubcategory: (req: SubcategoryRequest, res: Response) => Promise<void>;
    deleteSubcategory: (req: SubcategoryRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=SubCategoryController.d.ts.map