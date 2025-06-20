import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { SubcategoryInterface as ISubcategory } from "../../../Interfaces/models/SubcategoryInterface.js";
export declare class SubcategoryRepository extends BaseRepository<ISubcategory> {
    constructor();
    createSubcategory: (data: Partial<ISubcategory>) => Promise<ISubcategory>;
    getAllSubcategories: (categoryId: string) => Promise<ISubcategory[]>;
    getSubcategoryById: (id: string) => Promise<ISubcategory | null>;
    updateSubcategory: (id: string, data: Partial<ISubcategory>) => Promise<ISubcategory | null>;
    deleteSubcategory: (id: string) => Promise<ISubcategory | null>;
    deleteManySubcategories: (categoryId: string) => Promise<{
        deletedCount: number;
    }>;
}
//# sourceMappingURL=SubCategoryRepositry.d.ts.map