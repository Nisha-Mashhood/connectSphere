import { IGroup } from '../Models/i-group';
import { IGroupRequest } from '../Models/i-group-request';
import { GroupFormData, GroupQuery } from '../../Utils/types/group-types';
import { Types } from 'mongoose';

export interface IGroupRepository {
  createGroup(groupData: GroupFormData): Promise<IGroup>;
  findById(id: string): Promise<IGroup | null>;
  getGroupsByAdminId(adminId: string): Promise<IGroup[]>;
  getGroupById(groupId: string): Promise<IGroup | null>;
  getAllGroups(query?: GroupQuery): Promise<{ groups: IGroup[]; total: number }>;
  createGroupRequest(data: { groupId: string; userId: string }): Promise<IGroupRequest>;
  getGroupRequestsByGroupId(groupId: string): Promise<IGroupRequest[]>;
  getGroupRequestsByAdminId(adminId: string): Promise<IGroupRequest[]>;
  getGroupRequestsByUserId(userId: string): Promise<IGroupRequest[]>;
  findGroupRequestById(requestId: string): Promise<IGroupRequest | null>;
  updateGroupRequestStatus(requestId: string, status: 'Accepted' | 'Rejected'): Promise<IGroupRequest | null>;
  updateGroupPaymentStatus(requestId: string, amountPaid: number): Promise<IGroupRequest | null>;
  addMemberToGroup(groupId: string, userId: string): Promise<IGroup | null>;
  deleteGroupRequest(requestId: string): Promise<void>;
  removeGroupMember(groupId: string, userId: string): Promise<IGroup | null>;
  deleteGroupById(groupId: string): Promise<IGroup | null>;
  deleteGroupRequestsByGroupId(groupId: string): Promise<void>;
  updateGroupImage(groupId: string, updateData: { profilePic?: string; coverPic?: string }): Promise<IGroup | null>;
  getGroupDetailsByUserId(userId: string): Promise<IGroup[]>;
  getAllGroupRequests(search: string, page: number, limit: number): Promise<IGroupRequest[]>;
  isUserInGroup(groupId: string, userId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<Types.ObjectId[]>
}