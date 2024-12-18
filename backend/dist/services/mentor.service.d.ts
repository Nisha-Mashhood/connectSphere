export declare const submitMentorRequest: (data: Partial<import("../models/mentor.model.js").IMentor>) => Promise<import("../models/mentor.model.js").IMentor>;
export declare const getAllMentorRequests: () => Promise<import("../models/mentor.model.js").IMentor[]>;
export declare const approveMentorRequest: (id: string) => Promise<void>;
export declare const rejectMentorRequest: (id: string) => Promise<void>;
export declare const getMentorByUserId: (userId: string) => Promise<import("../models/mentor.model.js").IMentor | null>;
export declare const updateMentorById: (mentorId: string, updateData: Partial<import("../models/mentor.model.js").IMentor>) => Promise<import("../models/mentor.model.js").IMentor | null>;
//# sourceMappingURL=mentor.service.d.ts.map