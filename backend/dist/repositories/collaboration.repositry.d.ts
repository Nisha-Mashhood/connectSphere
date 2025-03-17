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
export declare const findMentorRequest: ({ page, limit, search }: {
    page: number;
    limit: number;
    search: string;
}) => Promise<{
    requests: (import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export declare const findCollab: ({ page, limit, search }: {
    page: number;
    limit: number;
    search: string;
}) => Promise<{
    collabs: (import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export declare const fetchMentorRequsetDetails: (requsetId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const findCollabDetails: (collabId: string) => Promise<ICollaboration[] | null>;
export declare const updateUnavailableDays: (collabId: string, updateData: {
    datesAndReasons: any;
    requestedBy: string;
    requesterId: string;
    approvedById: string;
    isApproved: string;
}) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateTemporarySlotChanges: (collabId: string, updateData: {
    datesAndNewSlots: any;
    requestedBy: string;
    requesterId: string;
    approvedById: string;
    isApproved: string;
}) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateRequestStatus: (collabId: string, requestId: string, requestType: "unavailable" | "timeSlot", status: "approved" | "rejected") => Promise<ICollaboration | null>;
export declare const getCollaborationByCollabId: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getCollaborationsByRequesterId: (requesterId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCollaborationsByApproverId: (approverId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=collaboration.repositry.d.ts.map