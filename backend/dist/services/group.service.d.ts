import { GroupFormData } from "../repositories/group.repositry.js";
import { Stripe } from "stripe";
import { GroupDocument } from "../models/group.model.js";
import mongoose from "mongoose";
export declare const createGroupService: (groupData: GroupFormData) => Promise<GroupDocument>;
export declare const fetchGroupDetails: (adminId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupDetailsService: (groupId: any) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const fetchGroups: () => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const requestToJoinGroup: (groupId: string, userId: string) => Promise<mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const fetchGroupRequestsByGroupId: (groupId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupRequestsByAdminId: (adminId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupRequestsByuserId: (userId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const modifyGroupRequestStatus: (requestId: string, status: "Accepted" | "Rejected") => Promise<{
    message: string;
}>;
export declare const processGroupPaymentService: (paymentMethodId: string | {
    id: string;
}, amount: number, requestId: string, email: string, groupRequestData: {
    groupId: string;
    userId: string;
}, returnUrl: string) => Promise<Stripe.Response<Stripe.PaymentIntent>>;
export declare const removeMemberFromGroup: (groupId: string, userId: string) => Promise<mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const deleteGroupByIdService: (groupId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateGroupImageService: (groupId: string, profilePic?: string, coverPic?: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const groupDetilsForMembers: (userId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchAllGroupRequests: () => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupRequestById: (requestId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=group.service.d.ts.map