export declare const createSubcategory: (data: Partial<import("../models/subcategory.model.js").SubcategoryInterface>) => Promise<import("mongoose").Document<unknown, {}, import("../models/subcategory.model.js").SubcategoryInterface> & import("../models/subcategory.model.js").SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllSubcategories: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/subcategory.model.js").SubcategoryInterface> & import("../models/subcategory.model.js").SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getSubcategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/subcategory.model.js").SubcategoryInterface> & import("../models/subcategory.model.js").SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateSubcategory: (id: string, data: Partial<import("../models/subcategory.model.js").SubcategoryInterface>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/subcategory.model.js").SubcategoryInterface> & import("../models/subcategory.model.js").SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteSubcategory: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/subcategory.model.js").SubcategoryInterface> & import("../models/subcategory.model.js").SubcategoryInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=subcategory.service.d.ts.map