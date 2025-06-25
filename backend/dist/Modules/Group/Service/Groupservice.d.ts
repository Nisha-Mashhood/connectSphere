import { BaseService } from '../../../core/Services/BaseService.js';
import { GroupDocument } from '../../../Interfaces/models/GroupDocument.js';
import { GroupRequestDocument } from '../../../Interfaces/models/GroupRequestDocument.js';
import { GroupFormData } from '../Types/types.js';
export declare class GroupService extends BaseService {
    private groupRepo;
    private contactRepo;
    private userRepo;
    constructor();
    createGroup: (groupData: GroupFormData) => Promise<GroupDocument>;
    getGroupDetails: (adminId: string) => Promise<GroupDocument[]>;
    getGroupById: (groupId: string) => Promise<GroupDocument | null>;
    getAllGroups: () => Promise<GroupDocument[]>;
    requestToJoinGroup: (groupId: string, userId: string) => Promise<GroupRequestDocument>;
    getGroupRequestsByGroupId: (groupId: string) => Promise<GroupRequestDocument[]>;
    getGroupRequestsByAdminId: (adminId: string) => Promise<GroupRequestDocument[]>;
    getGroupRequestsByUserId: (userId: string) => Promise<GroupRequestDocument[]>;
    getGroupRequestById: (requestId: string) => Promise<GroupRequestDocument | null>;
    modifyGroupRequestStatus: (requestId: string, status: "Accepted" | "Rejected") => Promise<{
        message: string;
    }>;
    processGroupPayment: (paymentMethodId: string | {
        id: string;
    }, amount: number, requestId: string, email: string, groupRequestData: {
        groupId: string;
        userId: string;
    }, returnUrl: string) => Promise<{
        paymentIntent: any;
    }>;
    removeGroupMember: (groupId: string, userId: string) => Promise<GroupDocument>;
    deleteGroup: (groupId: string) => Promise<GroupDocument | null>;
    updateGroupImage: (groupId: string, profilePic?: string, coverPic?: string) => Promise<GroupDocument | null>;
    getGroupDetailsForMembers: (userId: string) => Promise<GroupDocument[]>;
    getAllGroupRequests: () => Promise<GroupRequestDocument[]>;
}
//# sourceMappingURL=Groupservice.d.ts.map