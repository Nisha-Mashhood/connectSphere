import { IMentor } from "../models/mentor.model.js";
export declare const submitMentorRequest: (data: Partial<IMentor>) => Promise<IMentor>;
export declare const getAllMentorRequests: () => Promise<IMentor[]>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string) => Promise<void>;
export declare const getMentorByUserId: (userId: string) => Promise<IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
//# sourceMappingURL=mentor.repositry.d.ts.map