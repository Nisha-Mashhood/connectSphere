import { SkillInterface } from "../models/skills.model.js";
export declare const createSkill: (data: Partial<SkillInterface>) => Promise<import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllSkills: (subcategoryId: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getSkillById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateSkill: (id: string, data: Partial<SkillInterface>) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteSkill: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteManySkills: (categoryId: string) => Promise<import("mongodb").DeleteResult>;
export declare const deleteManySkillsbySubcategoryId: (subcategoryId: string) => Promise<import("mongodb").DeleteResult>;
export declare const getSkills: () => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=skills.repositry.d.ts.map