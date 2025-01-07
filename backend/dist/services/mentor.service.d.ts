export declare const submitMentorRequest: (mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    availableSlots: string[];
    certifications: string[];
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentor.model.js").IMentor> & import("../models/mentor.model.js").IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllMentorRequests: () => Promise<import("../models/mentor.model.js").IMentor[]>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string) => Promise<void>;
export declare const getMentorByUserId: (userId: string) => Promise<import("../models/mentor.model.js").IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<import("../models/mentor.model.js").IMentor>) => Promise<import("../models/mentor.model.js").IMentor | null>;
export declare const getSkills: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/skills.model.js").SkillInterface> & import("../models/skills.model.js").SkillInterface & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=mentor.service.d.ts.map