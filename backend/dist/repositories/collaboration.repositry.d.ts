import { ICollaboration } from "../models/collaboration.js";
export declare const createTemporaryRequest: (data: any) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getMentorRequestsByMentorId: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findMentorRequestById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateMentorRequestStatus: (id: string, status: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getRequestByUserId: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const createCollaboration: (collaborationData: Partial<ICollaboration>) => Promise<ICollaboration>;
export declare const deleteMentorRequest: (requestId: string) => Promise<void>;
export declare const findCollabById: (collabId: string) => Promise<ICollaboration | null>;
export declare const deleteCollabById: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const markCollabAsCancelled: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateCollabFeedback: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getCollabDataForUser: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCollabDataForMentor: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findMentorRequest: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findCollab: () => Promise<ICollaboration[] | null>;
export declare const fetchMentorRequsetDetails: (requsetId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const findCollabDetails: (collabId: string) => Promise<ICollaboration[] | null>;
//# sourceMappingURL=collaboration.repositry.d.ts.map