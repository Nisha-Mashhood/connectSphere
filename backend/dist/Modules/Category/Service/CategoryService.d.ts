import { BaseService } from "../../../core/Services/BaseService.js";
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
export declare class CategoryService extends BaseService {
    private categoryRepo;
    private subcategoryRepo;
    private skillsRepo;
    constructor();
    isDuplicateCategoryName: (name?: string, excludeId?: string) => Promise<boolean>;
    createCategory: (data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategory>;
    getAllCategories: () => Promise<ICategory[]>;
    getCategoryById: (id: string) => Promise<ICategory | null>;
    updateCategory: (id: string, data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategory | null>;
    deleteCategory: (id: string) => Promise<ICategory | null>;
}
//# sourceMappingURL=CategoryService.d.ts.map