import { ICollaboration } from "../Interfaces/models/ICollaboration.js";
export interface LockedSlot {
    day: string;
    timeSlots: string[];
}
export declare const createTemporaryRequest: (data: any) => Promise<import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getMentorRequestsByMentorId: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const findMentorRequestById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateMentorRequestStatus: (id: string, status: string) => Promise<import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getRequestByUserId: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const createCollaboration: (collaborationData: Partial<ICollaboration>) => Promise<ICollaboration>;
export declare const deleteMentorRequest: (requestId: string) => Promise<void>;
export declare const findCollabById: (collabId: string) => Promise<ICollaboration | null>;
export declare const deleteCollabById: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const markCollabAsCancelled: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateCollabFeedback: (collabId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getCollabDataForUser: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getCollabDataForMentor: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const findMentorRequest: ({ page, limit, search }: {
    page: number;
    limit: number;
    search: string;
}) => Promise<{
    requests: (import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
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
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export declare const fetchMentorRequsetDetails: (requsetId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
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
    _id: import("mongoose").Types.ObjectId;
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
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateRequestStatus: (collabId: string, requestId: string, requestType: "unavailable" | "timeSlot", status: "approved" | "rejected", newEndDate?: Date) => Promise<ICollaboration | null>;
export declare const getLockedSlotsByMentorId: (mentorId: string) => Promise<LockedSlot[]>;
//# sourceMappingURL=collaboration.repositry.d.ts.map