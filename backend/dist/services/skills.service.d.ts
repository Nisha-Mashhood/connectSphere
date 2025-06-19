import { SkillInterface } from "../Interfaces/models/SkillInterface.js";
export declare const createSkill: (data: Partial<SkillInterface>, imagePath?: string, fileSize?: number) => Promise<import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getAllSkills: (subcategoryId: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getSkillById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateSkill: (id: string, data: Partial<SkillInterface>, imagePath?: string, fileSize?: number) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const deleteSkill: (id: string) => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getSkills: () => Promise<(import("mongoose").Document<unknown, {}, SkillInterface> & SkillInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=skills.service.d.ts.map