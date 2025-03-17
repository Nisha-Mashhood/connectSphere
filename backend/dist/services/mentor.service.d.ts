import { IMentor } from "../models/mentor.model.js";
export declare const submitMentorRequest: (mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: string[];
    timePeriod: number;
    certifications: string[];
}) => Promise<import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getAllMentorRequests: (page?: number, limit?: number, search?: string, status?: string, sort?: string) => Promise<{
    mentors: IMentor[];
    total: number;
}>;
export declare const getAllMentors: () => Promise<IMentor[]>;
export declare const getMentorBymentorId: (mentorId: string) => Promise<IMentor | null>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string, reason: string) => Promise<void>;
export declare const cancelMentorship: (id: string) => Promise<void>;
export declare const getMentorByUserId: (userId: string) => Promise<IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
//# sourceMappingURL=mentor.service.d.ts.map