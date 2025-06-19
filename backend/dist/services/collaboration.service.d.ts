import { LockedSlot } from "../repositories/collaboration.repositry.js";
export declare const TemporaryRequestService: (requestData: any) => Promise<import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getMentorRequests: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const acceptRequest: (requestId: string) => Promise<import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const rejectRequest: (requestId: string) => Promise<import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getRequsetForUser: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const processPaymentService: (paymentMethodId: string, amount: number, requestId: string, mentorRequestData: any, email: string, returnUrl: string) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent> | {
    paymentIntent: import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>;
    contacts: import("../Interfaces/models/IContact.js").IContact[];
}>;
export declare const getCollabDataForUserService: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getCollabDataForMentorService: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const removecollab: (collabId: string, reason: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getMentorRequestsService: ({ page, limit, search, }: {
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
export declare const getCollabsService: ({ page, limit, search, }: {
    page: number;
    limit: number;
    search: string;
}) => Promise<{
    collabs: (import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export declare const fetchCollabById: (collabId: string) => Promise<import("../Interfaces/models/ICollaboration.js").ICollaboration[] | null>;
export declare const fetchRequsetById: (requestId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/IMentorRequest.js").IMentorRequest> & import("../Interfaces/models/IMentorRequest.js").IMentorRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const markUnavailableDaysService: (collabId: string, updateData: any) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateTemporarySlotChangesService: (collabId: string, updateData: any) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ICollaboration.js").ICollaboration> & import("../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const processTimeSlotRequest: (collabId: string, requestId: string, isApproved: boolean, requestType: "unavailable" | "timeSlot") => Promise<import("../Interfaces/models/ICollaboration.js").ICollaboration | null>;
export declare const getMentorLockedSlots: (mentorId: string) => Promise<LockedSlot[]>;
//# sourceMappingURL=collaboration.service.d.ts.map