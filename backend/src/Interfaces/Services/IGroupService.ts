import { IGroup } from "../Models/IGroup";
import { IGroupRequest } from "../Models/IGroupRequest";
import { GroupFormData, GroupQuery } from "../../Utils/Types/Group.types";

export interface IGroupService {
  createGroup: (groupData: GroupFormData) => Promise<IGroup>;
  getGroupDetails: (adminId: string) => Promise<IGroup[]>;
  getGroupById: (groupId: string) => Promise<IGroup | null>;
  getAllGroups: (query?: GroupQuery) => Promise<{ groups: IGroup[]; total: number }>;
  requestToJoinGroup: (groupId: string, userId: string) => Promise<IGroupRequest>;
  getGroupRequestsByGroupId: (groupId: string) => Promise<IGroupRequest[]>;
  getGroupRequestsByAdminId: (adminId: string) => Promise<IGroupRequest[]>;
  getGroupRequestsByUserId: (userId: string) => Promise<IGroupRequest[]>;
  getGroupRequestById: (requestId: string) => Promise<IGroupRequest | null>;
  modifyGroupRequestStatus: (
    requestId: string,
    status: "Accepted" | "Rejected"
  ) => Promise<{
    message: string;
    requiresPayment?: boolean;
    groupPrice?: number;
    groupId?: string;
  }>;
  processGroupPayment: (
    paymentMethodId: string | { id: string },
    amount: number,
    requestId: string,
    email: string,
    groupRequestData: { groupId: string; userId: string },
    returnUrl: string
  ) => Promise<{ paymentIntent: any }>;
  removeGroupMember: (groupId: string, userId: string) => Promise<IGroup>;
  deleteGroup: (groupId: string) => Promise<IGroup | null>;
  updateGroupImage: (
    groupId: string,
    profilePic?: string,
    coverPic?: string
  ) => Promise<IGroup | null>;
  getGroupDetailsForMembers: (userId: string) => Promise<IGroup[]>;
  getAllGroupRequests: () => Promise<IGroupRequest[]>;
}