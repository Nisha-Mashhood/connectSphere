export declare const createSkill: (data: Partial<import("../models/skills.model.js").SkillInterface>) => Promise<import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllSkills: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getSkillById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateSkill: (id: string, data: Partial<import("../models/skills.model.js").SkillInterface>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteSkill: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=skills.service.d.ts.map