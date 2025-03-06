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
export declare const processPaymentService: (token: any, amount: number, requestId: string, mentorRequestData: any) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Charge>>;
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
export declare const getMentorRequestsService: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getCollabsService: () => Promise<import("../models/collaboration.js").ICollaboration[] | null>;
export declare const fetchCollabById: (collabId: string) => Promise<import("../models/collaboration.js").ICollaboration[] | null>;
export declare const fetchRequsetById: (requestId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/mentorRequset.js").IMentorRequest> & import("../models/mentorRequset.js").IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=collaboration.service.d.ts.map