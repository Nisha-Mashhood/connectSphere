import { SkillInterface } from "../models/skills.model.js";
export declare const createSkill: (data: Partial<SkillInterface>) => Promise<import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllSkills: () => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
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
//# sourceMappingURL=skills.repositry.d.ts.map