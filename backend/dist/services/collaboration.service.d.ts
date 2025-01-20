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
//# sourceMappingURL=collaboration.service.d.ts.map