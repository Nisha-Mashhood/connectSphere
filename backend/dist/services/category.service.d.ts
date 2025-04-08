import { CategoryInterface } from "../models/category.model.js";
export declare const isDuplicateCategoryName: (name: string, excludeId?: string) => Promise<boolean>;
export declare const createCategory: (data: Partial<CategoryInterface>, imagePath?: string, fileSize?: number) => Promise<import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllCategories: () => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateCategory: (id: string, data: Partial<CategoryInterface>, imagePath?: string, fileSize?: number) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=category.service.d.ts.map