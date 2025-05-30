import { GroupDocument } from "../models/group.model.js";
import mongoose from "mongoose";
export interface GroupFormData {
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    availableSlots: {
        day: string;
        timeSlots: string[];
    }[];
    profilePic?: string;
    coverPic?: string;
    startDate?: string;
    adminId: string;
    createdAt?: Date;
    members?: string[];
}
export declare const createGroupRepository: (groupData: GroupFormData) => Promise<GroupDocument>;
export declare const getGroupsByAdminId: (adminId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupsByGroupId: (groupId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getGroups: () => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const sendRequestToGroup: (data: {
    groupId: string;
    userId: string;
}) => Promise<mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getGroupRequestsByGroupId: (groupId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupRequestsByAdminId: (adminId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupRequestsByuserId: (userId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findRequestById: (id: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const findGrouptById: (id: any) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const updateGroupReqStatus: (requestId: string, status: "Accepted" | "Rejected") => Promise<mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const updateGroupPaymentStatus: (requestId: string, amountPaid: number) => Promise<void>;
export declare const addMemberToGroup: (groupId: string, userId: string) => Promise<void>;
export declare const deleteGroupRequest: (requestId: string) => Promise<void>;
export declare const removeGroupMemberById: (groupId: string, userId: string) => Promise<mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const deleteGroupById: (groupId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const deleteGroupRequestsByGroupId: (groupId: string) => Promise<mongoose.mongo.DeleteResult>;
export declare const updateGroupImageRepositry: (groupId: string, updateData: {
    profilePic?: string;
    coverPic?: string;
}) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const groupDetilsByUserId: (userId: string) => Promise<(mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getAllGrouprequsets: () => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupRequestById: (requestId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const isUserInGroup: (groupId: string, userId: string) => Promise<boolean>;
//# sourceMappingURL=group.repositry.d.ts.map