export declare const createCategory: (data: Partial<import("../models/category.model.js").CategoryInterface>) => Promise<import("mongoose").Document<unknown, {}, import("../models/category.model.js").CategoryInterface> & import("../models/category.model.js").CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllCategories: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/category.model.js").CategoryInterface> & import("../models/category.model.js").CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/category.model.js").CategoryInterface> & import("../models/category.model.js").CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateCategory: (id: string, data: Partial<import("../models/category.model.js").CategoryInterface>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/category.model.js").CategoryInterface> & import("../models/category.model.js").CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteCategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/category.model.js").CategoryInterface> & import("../models/category.model.js").CategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=category.service.d.ts.map