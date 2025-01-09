import { IMentor } from "../models/mentor.model.js";
export declare const submitMentorRequest: (data: Partial<IMentor>) => Promise<IMentor>;
export declare const getAllMentorRequests: () => Promise<IMentor[]>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string) => Promise<void>;
export declare const cancelMentorship: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getMentorByUserId: (id: string) => Promise<IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
export declare const getSkills: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const saveMentorRequest: (mentorData: any) => Promise<import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
//# sourceMappingURL=mentor.repositry.d.ts.map