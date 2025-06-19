import { SubcategoryInterface } from "../Interfaces/models/SubcategoryInterface.js";
export declare const createSubcategory: (data: Partial<SubcategoryInterface>, imagePath?: string, fileSize?: number) => Promise<import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getAllSubcategories: (categoryId: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getSubcategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateSubcategory: (id: string, data: Partial<SubcategoryInterface>, imagePath?: string, fileSize?: number) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const deleteSubcategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=subcategory.service.d.ts.map