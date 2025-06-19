import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
export declare class CategoryRepository extends BaseRepository<ICategory> {
    constructor();
    createCategory(data: Partial<ICategory>): Promise<ICategory>;
    getAllCategories(): Promise<ICategory[]>;
    getCategoryById(id: string): Promise<ICategory | null>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    deleteCategory(id: string): Promise<ICategory | null>;
    isDuplicateCategoryName(name: string, excludeId?: string): Promise<boolean>;
}
//# sourceMappingURL=CategoryRepositry.d.ts.map