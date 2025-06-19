import { IMentor } from "../Interfaces/models/IMentor.js";
export declare const submitMentorRequest: (data: Partial<IMentor>) => Promise<IMentor>;
export declare const getAllMentorRequests: (page?: number, limit?: number, search?: string, status?: string, sort?: string) => Promise<{
    mentors: IMentor[];
    total: number;
}>;
export declare const getAllMentors: () => Promise<IMentor[]>;
export declare const getMentorDetails: (id: string) => Promise<IMentor | null>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string) => Promise<void>;
export declare const cancelMentorship: (id: string) => Promise<(import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getMentorById: (id: string) => Promise<IMentor | null>;
export declare const getMentorByUserId: (id: string) => Promise<IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
export declare const saveMentorRequest: (mentorData: any) => Promise<import("mongoose").Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=mentor.repositry.d.ts.map