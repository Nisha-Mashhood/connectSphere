export declare const TemporaryRequestService: (requestData: any) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getMentorRequests: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const acceptRequest: (requestId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const rejectRequest: (requestId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getRequsetForUser: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const processPaymentService: (paymentMethodId: string, amount: number, requestId: string, mentorRequestData: any, email: string, returnUrl: string) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
export declare const getCollabDataForUserService: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCollabDataForMentorService: (mentorId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const removecollab: (collabId: string, reason: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getMentorRequestsService: ({ page, limit, search }: {
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
export declare const getCollabsService: ({ page, limit, search }: {
    page: number;
    limit: number;
    search: string;
}) => Promise<{
    collabs: (import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export declare const fetchCollabById: (collabId: string) => Promise<import("../models/collaboration.js").ICollaboration[] | null>;
export declare const fetchRequsetById: (requestId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const markUnavailableDaysService: (collabId: string, updateData: any) => Promise<(import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateTemporarySlotChangesService: (collabId: string, updateData: any) => Promise<(import("mongoose").Document<unknown, {}, import("../models/collaboration.js").ICollaboration> & import("../models/collaboration.js").ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const processTimeSlotRequest: (collabId: string, requestId: string, isApproved: boolean, requestType: "unavailable" | "timeSlot") => Promise<import("../models/collaboration.js").ICollaboration | null>;
//# sourceMappingURL=collaboration.service.d.ts.map