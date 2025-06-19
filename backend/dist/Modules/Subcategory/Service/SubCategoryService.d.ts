import { BaseService } from "../../../core/Services/BaseService.js";
import { SubcategoryInterface as ISubcategory } from "../../../Interfaces/models/SubcategoryInterface.js";
export declare class SubcategoryService extends BaseService {
    private subcategoryRepo;
    private skillsRepo;
    constructor();
    createSubcategory(data: Partial<ISubcategory>, imagePath?: string, fileSize?: number): Promise<ISubcategory>;
    getAllSubcategories(categoryId: string): Promise<ISubcategory[]>;
    getSubcategoryById(id: string): Promise<ISubcategory | null>;
    updateSubcategory(id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number): Promise<ISubcategory | null>;
    deleteSubcategory(id: string): Promise<ISubcategory | null>;
}
//# sourceMappingURL=SubCategoryService.d.ts.map