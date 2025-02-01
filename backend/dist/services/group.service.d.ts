import { GroupFormData } from "../repositories/group.repositry.js";
export declare const createGroupService: (groupData: GroupFormData) => Promise<import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const fetchGroupDetails: (adminId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroups: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/group.model.js").GroupDocument> & import("../models/group.model.js").GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const requestToJoinGroup: (groupId: string, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const fetchGroupRequestsByGroupId: (groupId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupRequestsByAdminId: (adminId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const fetchGroupRequestsByuserId: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const modifyGroupRequestStatus: (requestId: string, status: "Approved" | "Rejected") => Promise<(import("mongoose").Document<unknown, {}, import("../models/groupRequest.model.js").GroupRequestDocument> & import("../models/groupRequest.model.js").GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=group.service.d.ts.map