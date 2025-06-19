import { CategoryInterface } from "../Interfaces/models/CategoryInterface.js";
export declare const createCategory: (data: Partial<CategoryInterface>) => Promise<import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getAllCategories: () => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateCategory: (id: string, data: Partial<CategoryInterface>) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, CategoryInterface> & CategoryInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const isDuplicateCategoryName: (name: string, excludeId?: string) => Promise<boolean>;
//# sourceMappingURL=category.repositry.d.ts.map