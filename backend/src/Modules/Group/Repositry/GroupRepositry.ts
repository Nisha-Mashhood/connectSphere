import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import Group from '../../../models/group.model.js';
import GroupRequest from '../../../models/groupRequest.model.js';
import { GroupDocument } from '../../../Interfaces/models/GroupDocument.js';
import { GroupRequestDocument } from '../../../Interfaces/models/GroupRequestDocument.js';
import { GroupFormData } from '../Types/types.js';


export class GroupRepository extends BaseRepository<GroupDocument> {
  private groupRequestModel: Model<GroupRequestDocument>;

  constructor() {
    super(Group as Model<GroupDocument>);
    this.groupRequestModel = GroupRequest;
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

   createGroup = async(groupData: GroupFormData): Promise<GroupDocument> => {
    try {
      logger.debug(`Creating group: ${groupData.name}`);
      return await this.create({
        ...groupData,
        adminId: this.toObjectId(groupData.adminId),
        createdAt: groupData.createdAt || new Date(),
        isFull: false,
        startDate: groupData.startDate ? new Date(groupData.startDate) : undefined,
        members: groupData.members
          ? groupData.members.map((id) => ({
              userId: this.toObjectId(id),
              joinedAt: new Date(),
            }))
          : [],
      });
    } catch (error: any) {
      logger.error(`Error creating group: ${error.message}`);
      throw new RepositoryError(`Error creating group: ${error.message}`);
    }
  }

   getGroupsByAdminId = async(adminId: string): Promise<GroupDocument[]> =>{
    try {
      logger.debug(`Fetching groups for admin: ${adminId}`);
      return await this.model
        .find({ adminId: this.toObjectId(adminId) })
        .populate('members.userId', 'name email jobTitle profilePic')
        .populate('adminId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching groups by adminId: ${error.message}`);
      throw new RepositoryError(`Error fetching groups: ${error.message}`);
    }
  }

   getGroupById = async(groupId: string): Promise<GroupDocument | null> => {
    try {
      logger.debug(`Fetching group by ID: ${groupId}`);
      return await this.model
        .findById(this.toObjectId(groupId))
        .populate('members.userId', 'name email jobTitle profilePic')
        .populate('adminId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching group by ID: ${error.message}`);
      throw new RepositoryError(`Error fetching group by ID: ${error.message}`);
    }
  }

   getAllGroups = async(): Promise<GroupDocument[]> => {
    try {
      logger.debug('Fetching all groups');
      return await this.model
        .find()
        .populate('members.userId', 'name email jobTitle profilePic')
        .populate('adminId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching all groups: ${error.message}`);
      throw new RepositoryError(`Error fetching all groups: ${error.message}`);
    }
  }

   createGroupRequest = async(data: { groupId: string; userId: string }): Promise<GroupRequestDocument> => {
    try {
      logger.debug(`Creating group request for group: ${data.groupId}, user: ${data.userId}`);
      return await this.groupRequestModel.create({
        groupId: this.toObjectId(data.groupId),
        userId: this.toObjectId(data.userId),
        status: 'Pending',
        paymentStatus: 'Pending',
      });
    } catch (error: any) {
      logger.error(`Error creating group request: ${error.message}`);
      throw new RepositoryError(`Error creating group request: ${error.message}`);
    }
  }

   getGroupRequestsByGroupId = async(groupId: string): Promise<GroupRequestDocument[]> => {
    try {
      logger.debug(`Fetching group requests for group: ${groupId}`);
      return await this.groupRequestModel
        .find({ groupId: this.toObjectId(groupId) })
        .populate({
          path: 'groupId',
          populate: {
            path: 'members.userId',
            model: 'User',
            select: 'name email jobTitle profilePic',
          },
        })
        .populate('userId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching group requests by groupId: ${error.message}`);
      throw new RepositoryError(`Error fetching group requests: ${error.message}`);
    }
  }

   getGroupRequestsByAdminId = async(adminId: string): Promise<GroupRequestDocument[]> => {
    try {
      logger.debug(`Fetching group requests for admin: ${adminId}`);
      return await this.groupRequestModel
        .find()
        .populate({
          path: 'groupId',
          match: { adminId: this.toObjectId(adminId) },
          populate: {
            path: 'members.userId',
            model: 'User',
            select: 'name email jobTitle profilePic',
          },
        })
        .populate('userId', 'name email jobTitle profilePic')
        .exec()
        .then((requests) => requests.filter((req) => req.groupId));
    } catch (error: any) {
      logger.error(`Error fetching group requests by adminId: ${error.message}`);
      throw new RepositoryError(`Error fetching group requests: ${error.message}`);
    }
  }

   getGroupRequestsByUserId = async(userId: string): Promise<GroupRequestDocument[]> => {
    try {
      logger.debug(`Fetching group requests for user: ${userId}`);
      return await this.groupRequestModel
        .find({ userId: this.toObjectId(userId) })
        .populate({
          path: 'groupId',
          populate: {
            path: 'members.userId',
            model: 'User',
            select: 'name email jobTitle profilePic',
          },
        })
        .populate('userId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching group requests by userId: ${error.message}`);
      throw new RepositoryError(`Error fetching group requests: ${error.message}`);
    }
  }

   findGroupRequestById = async(requestId: string): Promise<GroupRequestDocument | null> => {
    try {
      logger.debug(`Fetching group request by ID: ${requestId}`);
      return await this.groupRequestModel
        .findById(this.toObjectId(requestId))
        .populate({
          path: 'groupId',
          populate: [
            {
              path: 'adminId',
              model: 'User',
              select: 'name email jobTitle profilePic',
            },
            {
              path: 'members.userId',
              model: 'User',
              select: 'name email jobTitle profilePic',
            },
          ],
        })
        .populate('userId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching group request by ID: ${error.message}`);
      throw new RepositoryError(`Error fetching group request by ID: ${error.message}`);
    }
  }

   updateGroupRequestStatus = async(
    requestId: string,
    status: 'Accepted' | 'Rejected'
  ): Promise<GroupRequestDocument | null> => {
    try {
      logger.debug(`Updating group request status for ID: ${requestId} to ${status}`);
      return await this.groupRequestModel
        .findByIdAndUpdate(this.toObjectId(requestId), { status }, { new: true })
        .exec();
    } catch (error: any) {
      logger.error(`Error updating group request status: ${error.message}`);
      throw new RepositoryError(`Error updating group request status: ${error.message}`);
    }
  }

   updateGroupPaymentStatus = async(
    requestId: string,
    amountPaid: number
  ): Promise<GroupRequestDocument | null> => {
    try {
      logger.debug(`Updating group payment status for request: ${requestId}`);
      return await this.groupRequestModel
        .findByIdAndUpdate(
          this.toObjectId(requestId),
          { paymentStatus: 'Completed', amountPaid },
          { new: true }
        )
        .exec();
    } catch (error: any) {
      logger.error(`Error updating group payment status: ${error.message}`);
      throw new RepositoryError(`Error updating group payment status: ${error.message}`);
    }
  }

   addMemberToGroup = async(groupId: string, userId: string): Promise<GroupDocument | null> => {
    try {
      logger.debug(`Adding user ${userId} to group ${groupId}`);
      const group = await this.model.findById(this.toObjectId(groupId)).exec();
      if (!group) {
        throw new RepositoryError('Group not found');
      }
      const isUserAlreadyInGroup = group.members.some(
        (member) => member.userId.toString() === userId
      );
      if (!isUserAlreadyInGroup) {
        group.members.push({ userId: this.toObjectId(userId), joinedAt: new Date() });
        group.isFull = group.members.length >= group.maxMembers;
        return await group.save();
      }
      return group;
    } catch (error: any) {
      logger.error(`Error adding member to group: ${error.message}`);
      throw new RepositoryError(`Error adding member to group: ${error.message}`);
    }
  }

   deleteGroupRequest = async(requestId: string): Promise<void> => {
    try {
      logger.debug(`Deleting group request: ${requestId}`);
      await this.groupRequestModel.findByIdAndDelete(this.toObjectId(requestId)).exec();
    } catch (error: any) {
      logger.error(`Error deleting group request: ${error.message}`);
      throw new RepositoryError(`Error deleting group request: ${error.message}`);
    }
  }

   removeGroupMember = async(groupId: string, userId: string): Promise<GroupDocument | null> =>{
    try {
      logger.debug(`Removing user ${userId} from group ${groupId}`);
      const group = await this.model.findById(this.toObjectId(groupId)).exec();
      if (!group) {
        throw new RepositoryError('Group not found');
      }
      if (userId === group.adminId.toString()) {
        throw new RepositoryError('Cannot remove admin from group members');
      }
      group.members = group.members.filter(
        (member) => member.userId.toString() !== userId
      );
      group.isFull = group.members.length >= group.maxMembers;
      return await group.save();
    } catch (error: any) {
      logger.error(`Error removing group member: ${error.message}`);
      throw new RepositoryError(`Error removing group member: ${error.message}`);
    }
  }

   deleteGroupById = async(groupId: string): Promise<GroupDocument | null> => {
    try {
      logger.debug(`Deleting group: ${groupId}`);
      return await this.findByIdAndDelete(this.toObjectId(groupId).toString());
    } catch (error: any) {
      logger.error(`Error deleting group: ${error.message}`);
      throw new RepositoryError(`Error deleting group: ${error.message}`);
    }
  }

   deleteGroupRequestsByGroupId = async(groupId: string): Promise<void> => {
    try {
      logger.debug(`Deleting group requests for group: ${groupId}`);
      await this.groupRequestModel.deleteMany({ groupId: this.toObjectId(groupId) }).exec();
    } catch (error: any) {
      logger.error(`Error deleting group requests: ${error.message}`);
      throw new RepositoryError(`Error deleting group requests: ${error.message}`);
    }
  }

   updateGroupImage = async(
    groupId: string,
    updateData: { profilePic?: string; coverPic?: string }
  ): Promise<GroupDocument | null> => {
    try {
      logger.debug(`Updating group image for group: ${groupId}`);
      return await this.findByIdAndUpdate(
        this.toObjectId(groupId).toString(),
        updateData,
        { new: true }
      );
    } catch (error: any) {
      logger.error(`Error updating group image: ${error.message}`);
      throw new RepositoryError(`Error updating group image: ${error.message}`);
    }
  }

   getGroupDetailsByUserId = async(userId: string): Promise<GroupDocument[]> => {
    try {
      logger.debug(`Fetching group details for user: ${userId}`);
      return await this.model
        .find({ 'members.userId': this.toObjectId(userId) })
        .populate('members.userId', 'name email jobTitle profilePic')
        .populate('adminId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching group details by userId: ${error.message}`);
      throw new RepositoryError(`Error fetching group details: ${error.message}`);
    }
  }

   getAllGroupRequests = async(): Promise<GroupRequestDocument[]> => {
    try {
      logger.debug('Fetching all group requests');
      return await this.groupRequestModel
        .find()
        .populate({
          path: 'groupId',
          populate: {
            path: 'members.userId',
            model: 'User',
            select: 'name email jobTitle profilePic',
          },
        })
        .populate('userId', 'name email jobTitle profilePic')
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching all group requests: ${error.message}`);
      throw new RepositoryError(`Error fetching all group requests: ${error.message}`);
    }
  }

   isUserInGroup = async(groupId: string, userId: string): Promise<boolean> =>{
    try {
      logger.debug(`Checking if user ${userId} is in group ${groupId}`);
      const group = await this.model
        .findOne({ _id: this.toObjectId(groupId), 'members.userId': this.toObjectId(userId) })
        .exec();
      return !!group;
    } catch (error: any) {
      logger.error(`Error checking group membership: ${error.message}`);
      throw new RepositoryError(`Error checking group membership: ${error.message}`);
    }
  }
}