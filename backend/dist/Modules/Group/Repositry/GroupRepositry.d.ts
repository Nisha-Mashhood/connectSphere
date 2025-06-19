import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { GroupDocument } from '../../../Interfaces/models/GroupDocument.js';
import { GroupRequestDocument } from '../../../Interfaces/models/GroupRequestDocument.js';
import { TimeSlot } from '../../../Interfaces/models/GroupDocument.js';
export interface GroupFormData {
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    availableSlots: TimeSlot[];
    profilePic?: string;
    coverPic?: string;
    startDate?: string;
    adminId: string | Types.ObjectId;
    createdAt?: Date;
    members?: string[];
}
export declare class GroupRepository extends BaseRepository<GroupDocument> {
    private groupRequestModel;
    constructor();
    private toObjectId;
    createGroup(groupData: GroupFormData): Promise<GroupDocument>;
    getGroupsByAdminId(adminId: string): Promise<GroupDocument[]>;
    getGroupById(groupId: string): Promise<GroupDocument | null>;
    getAllGroups(): Promise<GroupDocument[]>;
    createGroupRequest(data: {
        groupId: string;
        userId: string;
    }): Promise<GroupRequestDocument>;
    getGroupRequestsByGroupId(groupId: string): Promise<GroupRequestDocument[]>;
    getGroupRequestsByAdminId(adminId: string): Promise<GroupRequestDocument[]>;
    getGroupRequestsByUserId(userId: string): Promise<GroupRequestDocument[]>;
    findGroupRequestById(requestId: string): Promise<GroupRequestDocument | null>;
    updateGroupRequestStatus(requestId: string, status: 'Accepted' | 'Rejected'): Promise<GroupRequestDocument | null>;
    updateGroupPaymentStatus(requestId: string, amountPaid: number): Promise<GroupRequestDocument | null>;
    addMemberToGroup(groupId: string, userId: string): Promise<GroupDocument | null>;
    deleteGroupRequest(requestId: string): Promise<void>;
    removeGroupMember(groupId: string, userId: string): Promise<GroupDocument | null>;
    deleteGroupById(groupId: string): Promise<GroupDocument | null>;
    deleteGroupRequestsByGroupId(groupId: string): Promise<void>;
    updateGroupImage(groupId: string, updateData: {
        profilePic?: string;
        coverPic?: string;
    }): Promise<GroupDocument | null>;
    getGroupDetailsByUserId(userId: string): Promise<GroupDocument[]>;
    getAllGroupRequests(): Promise<GroupRequestDocument[]>;
    isUserInGroup(groupId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=GroupRepositry.d.ts.map