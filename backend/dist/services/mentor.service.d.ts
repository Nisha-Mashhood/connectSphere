import { IMentor } from "../models/mentor.model.js";
export declare const submitMentorRequest: (mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    availableSlots: string[];
    certifications: string[];
}) => Promise<import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllMentorRequests: () => Promise<IMentor[]>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string, reason: string) => Promise<void>;
export declare const getMentorByUserId: (userId: string) => Promise<IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
export declare const getSkills: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=mentor.service.d.ts.map