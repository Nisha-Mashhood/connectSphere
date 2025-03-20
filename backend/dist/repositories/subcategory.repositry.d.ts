import { SubcategoryInterface } from "../models/subcategory.model.js";
export declare const createSubcategory: (data: Partial<SubcategoryInterface>) => Promise<import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllSubcategories: (categoryId: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getSubcategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateSubcategory: (id: string, data: Partial<SubcategoryInterface>) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteSubcategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SubcategoryInterface> & SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteManySubcategories: (categoryId: string) => Promise<import("mongodb").DeleteResult>;
//# sourceMappingURL=subcategory.repositry.d.ts.map