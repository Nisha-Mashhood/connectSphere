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
    adminId: string;
    createdAt?: Date;
    members?: string[];
}
export declare const createGroupRepository: (groupData: GroupFormData) => Promise<import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getGroupsByAdminId: (adminId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroups: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const sendRequestToGroup: (data: {
    groupId: string;
    userId: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getGroupRequestsByGroupId: (groupId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupRequestsByAdminId: (adminId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupRequestsByuserId: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const updateGroupRequestStatus: (requestId: string, status: "Approved" | "Rejected") => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=group.repositry.d.ts.map