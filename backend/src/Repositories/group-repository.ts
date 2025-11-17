import { injectable } from 'inversify';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import Group from '../Models/group-model';
import GroupRequest from '../Models/group-request-model';
import { IGroup } from '../Interfaces/Models/i-group';
import { IGroupRequest } from '../Interfaces/Models/i-group-request';
import { GroupFormData, GroupQuery } from '../Utils/types/group-types';
import { StatusCodes } from '../enums/status-code-enums';
import { IGroupRepository } from '../Interfaces/Repository/i-group-repositry';

@injectable()
export class GroupRepository extends BaseRepository<IGroup> implements IGroupRepository{
  private _groupRequestModel: Model<IGroupRequest>;

  constructor() {
    super(Group as Model<IGroup>);
    this._groupRequestModel = GroupRequest;
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

   public createGroup = async (groupData: GroupFormData): Promise<IGroup> => {
    try {
      logger.debug(`Creating group with name: ${groupData.name}`);
      const newGroup = await this.create({
        ...groupData,
        adminId: this.toObjectId(groupData.adminId),
        createdAt: groupData.createdAt || new Date(),
        isFull: false,
        startDate: groupData.startDate ? new Date(groupData.startDate) : undefined,
        members: groupData.members
          ? groupData.members.map((userId: string) => ({
              userId: this.toObjectId(userId),
              joinedAt: new Date(),
            }))
          : [],
      });
      logger.info(`Created group: ${newGroup._id}`);
      return newGroup;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating group with name ${groupData.name}`, err);
      throw new RepositoryError('Error creating group', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getGroupsByAdminId = async (adminId: string): Promise<IGroup[]> => {
    try {
      logger.debug(`Fetching groups for admin: ${adminId}`);
      const groups = await this.model
        .find({ adminId: this.toObjectId(adminId) })
        .populate('members.userId', '_id name email jobTitle profilePic')
        .populate('adminId', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Fetched ${groups.length} groups for adminId: ${adminId}`);
      return groups;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching groups for adminId ${adminId}`, err);
      throw new RepositoryError('Error fetching groups by admin ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getGroupById = async (groupId: string): Promise<IGroup | null> => {
    try {
      logger.debug(`Fetching group by ID: ${groupId}`);
      const group = await this.model
        .findById(this.toObjectId(groupId))
        .populate('members.userId')
        .populate('adminId')
        .exec();
      logger.info(`Group ${group ? 'found' : 'not found'}: ${groupId}`);
      return group;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group by ID ${groupId}`, err);
      throw new RepositoryError('Error fetching group by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getAllGroups = async (query: GroupQuery = {}): Promise<{ groups: IGroup[]; total: number }> => {
    try {
      logger.debug(`Fetching all groups with query: ${JSON.stringify(query)}`);
      const { search, page, limit, excludeAdminId } = query;

      if (!search && !page && !limit) {
        const groups = await this.model
          .find()
          .populate('members.userId', '_id name email jobTitle profilePic')
          .populate('adminId', '_id name email jobTitle profilePic')
          .exec();
        logger.info(`Fetched ${groups.length} groups`);
        return { groups, total: groups.length };
      }

      const matchStage: Record<string, any> = {};
      if (search) {
        matchStage.name = { $regex: search, $options: 'i' };
      }
      if (excludeAdminId) {
        matchStage.adminId = { $ne: this.toObjectId(excludeAdminId) };
      }

      const pipeline = [
      { $match: matchStage },
      { $unwind: { path: '$members', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'members.userId',
        },
      },
      {
        $unwind: {
          path: '$members.userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          groupId: { $first: '$groupId' },
          name: { $first: '$name' },
          bio: { $first: '$bio' },
          price: { $first: '$price' },
          maxMembers: { $first: '$maxMembers' },
          isFull: { $first: '$isFull' },
          availableSlots: { $first: '$availableSlots' },
          profilePic: { $first: '$profilePic' },
          coverPic: { $first: '$coverPic' },
          startDate: { $first: '$startDate' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          adminId: { $first: '$adminId' },
          members: {
            $push: {
              $cond: [
                { $eq: ['$members', {}] },
                null,
                {
                  userId: '$members.userId',
                  joinedAt: '$members.joinedAt',
                  _id: '$members._id',
                },
              ],
            },
          },
        },
      },
      {
        $addFields: {
          members: {
            $filter: {
              input: '$members',
              as: 'member',
              cond: { $ne: ['$$member', null] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'adminId',
          foreignField: '_id',
          as: 'adminId',
        },
      },
      {
        $unwind: {
          path: '$adminId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          groups: [
            { $skip: ((page || 1) - 1) * (limit || 10) },
            { $limit: limit || 10 },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

      const result = await this.model.aggregate(pipeline).exec();
      const groups = result[0]?.groups || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${groups.length} groups, total: ${total}`);
      return { groups, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all groups`, err);
      throw new RepositoryError('Error fetching all groups', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public createGroupRequest = async (data: { groupId: string; userId: string }): Promise<IGroupRequest> => {
    try {
      logger.debug(`Creating group request for group: ${data.groupId}, user: ${data.userId}`);
      const request = await this._groupRequestModel.create({
        groupId: this.toObjectId(data.groupId),
        userId: this.toObjectId(data.userId),
        status: 'Pending',
        paymentStatus: 'Pending',
      });
      logger.info(`Group request created: ${request._id}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating group request for group ${data.groupId}`, err);
      throw new RepositoryError('Error creating group request', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getGroupRequestsByGroupId = async (groupId: string): Promise<IGroupRequest[]> => {
    try {
      logger.debug(`Fetching group requests for group: ${groupId}`);
      const requests = await this._groupRequestModel
        .find({ groupId: this.toObjectId(groupId) })
        .populate({
          path: 'groupId',
          populate: {
            path: 'members.userId',
            model: 'User',
            select: '_id name email jobTitle profilePic',
          },
        })
        .populate('userId', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Fetched ${requests.length} group requests for groupId: ${groupId}`);
      return requests;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group requests for groupId ${groupId}`, err);
      throw new RepositoryError('Error fetching group requests by group ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getGroupRequestsByAdminId = async (adminId: string): Promise<IGroupRequest[]> => {
    try {
      logger.debug(`Fetching group requests for admin: ${adminId}`);
      const requests = await this._groupRequestModel
        .find()
        .populate({
          path: 'groupId',
          match: { adminId: this.toObjectId(adminId) },
          populate: {
            path: 'members.userId',
            model: 'User',
            select: '_id name email jobTitle profilePic',
          },
        })
        .populate('userId', '_id name email jobTitle profilePic')
        .exec()
        .then((requests) => requests.filter((req) => req.groupId));
      logger.info(`Fetched ${requests.length} group requests for adminId: ${adminId}`);
      return requests;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group requests for adminId ${adminId}`, err);
      throw new RepositoryError('Error fetching group requests by admin ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getGroupRequestsByUserId = async (userId: string): Promise<IGroupRequest[]> => {
    try {
      logger.debug(`Fetching group requests for user: ${userId}`);
      const requests = await this._groupRequestModel
        .find({ userId: this.toObjectId(userId) })
        .populate({
          path: 'groupId',
          populate: {
            path: 'members.userId',
            model: 'User',
            select: '_id name email jobTitle profilePic',
          },
        })
        .populate('userId', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Fetched ${requests.length} group requests for userId: ${userId}`);
      return requests;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group requests for userId ${userId}`, err);
      throw new RepositoryError('Error fetching group requests by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public findGroupRequestById = async (requestId: string): Promise<IGroupRequest | null> => {
    try {
      logger.debug(`Fetching group request by ID: ${requestId}`);
      const request = await this._groupRequestModel
        .findById(this.toObjectId(requestId))
        .populate({
          path: 'groupId',
          populate: [
            {
              path: 'adminId',
              model: 'User',
              select: '_id name email jobTitle profilePic',
            },
            {
              path: 'members.userId',
              model: 'User',
              select: '_id name email jobTitle profilePic',
            },
          ],
        })
        .populate('userId', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Group request ${request ? 'found' : 'not found'}: ${requestId}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group request by ID ${requestId}`, err);
      throw new RepositoryError('Error fetching group request by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public updateGroupRequestStatus = async (
    requestId: string,
    status: 'Accepted' | 'Rejected'
  ): Promise<IGroupRequest | null> => {
    try {
      logger.debug(`Updating group request status for ID: ${requestId} to ${status}`);
      const request = await this._groupRequestModel
        .findByIdAndUpdate(this.toObjectId(requestId), { status }, { new: true })
        .exec();
      if (!request) {
        logger.warn(`Group request not found: ${requestId}`);
        throw new RepositoryError(`Group request not found with ID: ${requestId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Group request status updated: ${requestId} to ${status}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating group request status for ID ${requestId}`, err);
      throw new RepositoryError('Error updating group request status', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public updateGroupPaymentStatus = async (
    requestId: string,
    amountPaid: number
  ): Promise<IGroupRequest | null> => {
    try {
      logger.debug(`Updating group payment status for request: ${requestId}`);
      const request = await this._groupRequestModel
        .findByIdAndUpdate(
          this.toObjectId(requestId),
          { paymentStatus: 'Completed', amountPaid },
          { new: true }
        )
        .exec();
      if (!request) {
        logger.warn(`Group request not found: ${requestId}`);
        throw new RepositoryError(`Group request not found with ID: ${requestId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Group payment status updated: ${requestId}`);
      return request;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating group payment status for request ${requestId}`, err);
      throw new RepositoryError('Error updating group payment status', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public addMemberToGroup = async (groupId: string, userId: string): Promise<IGroup | null> => {
    try {
      logger.debug(`Adding user ${userId} to group ${groupId}`);
      const group = await this.model.findById(this.toObjectId(groupId)).exec();
      if (!group) {
        logger.warn(`Group not found: ${groupId}`);
        throw new RepositoryError(`Group not found with ID: ${groupId}`, StatusCodes.NOT_FOUND);
      }
      const isUserAlreadyInGroup = group.members.some(
        (member) => member.userId.toString() === userId
      );
      if (!isUserAlreadyInGroup) {
        group.members.push({ userId: this.toObjectId(userId), joinedAt: new Date() });
        group.isFull = group.members.length >= group.maxMembers;
        const updatedGroup = await group.save();
        logger.info(`User ${userId} added to group ${groupId}`);
        return updatedGroup;
      }
      logger.info(`User ${userId} already in group ${groupId}`);
      return group;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error adding user ${userId} to group ${groupId}`, err);
      throw new RepositoryError('Error adding member to group', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteGroupRequest = async (requestId: string): Promise<void> => {
    try {
      logger.debug(`Deleting group request: ${requestId}`);
      const result = await this._groupRequestModel.findByIdAndDelete(this.toObjectId(requestId)).exec();
      if (!result) {
        logger.warn(`Group request not found: ${requestId}`);
        throw new RepositoryError(`Group request not found with ID: ${requestId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Group request deleted: ${requestId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting group request ${requestId}`, err);
      throw new RepositoryError('Error deleting group request', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public removeGroupMember = async (groupId: string, userId: string): Promise<IGroup | null> => {
    try {
      logger.debug(`Removing user ${userId} from group ${groupId}`);
      const group = await this.model.findById(this.toObjectId(groupId)).exec();
      if (!group) {
        logger.warn(`Group not found: ${groupId}`);
        throw new RepositoryError(`Group not found with ID: ${groupId}`, StatusCodes.NOT_FOUND);
      }
      if (userId === group.adminId.toString()) {
        logger.warn(`Attempted to remove admin ${userId} from group ${groupId}`);
        throw new RepositoryError('Cannot remove admin from group members', StatusCodes.BAD_REQUEST);
      }
      group.members = group.members.filter(
        (member) => member.userId.toString() !== userId
      );
      group.isFull = group.members.length >= group.maxMembers;
      const updatedGroup = await group.save();
      logger.info(`User ${userId} removed from group ${groupId}`);
      return updatedGroup;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error removing user ${userId} from group ${groupId}`, err);
      throw new RepositoryError('Error removing group member', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteGroupById = async (groupId: string): Promise<IGroup | null> => {
    try {
      logger.debug(`Deleting group: ${groupId}`);
      const group = await this.findByIdAndDelete(groupId);
      if (!group) {
        logger.warn(`Group not found: ${groupId}`);
        throw new RepositoryError(`Group not found with ID: ${groupId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Group deleted: ${groupId}`);
      return group;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting group ${groupId}`, err);
      throw new RepositoryError('Error deleting group', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public deleteGroupRequestsByGroupId = async (groupId: string): Promise<void> => {
    try {
      logger.debug(`Deleting group requests for group: ${groupId}`);
      const result = await this._groupRequestModel.deleteMany({ groupId: this.toObjectId(groupId) }).exec();
      logger.info(`Deleted ${result.deletedCount || 0} group requests for groupId: ${groupId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting group requests for groupId ${groupId}`, err);
      throw new RepositoryError('Error deleting group requests', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateGroupImage = async (
    groupId: string,
    updateData: { profilePic?: string; coverPic?: string }
  ): Promise<IGroup | null> => {
    try {
      logger.debug(`Updating group image for group: ${groupId}`);
      const group = await this.findByIdAndUpdate(groupId, updateData, { new: true });
      if (!group) {
        logger.warn(`Group not found: ${groupId}`);
        throw new RepositoryError(`Group not found with ID: ${groupId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Group image updated for group: ${groupId}`);
      return group;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating group image for group ${groupId}`, err);
      throw new RepositoryError('Error updating group image', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getGroupDetailsByUserId = async (userId: string): Promise<IGroup[]> => {
    try {
      logger.debug(`Fetching group details for user: ${userId}`);
      const groups = await this.model
        .find({ 'members.userId': this.toObjectId(userId) })
        .populate('members.userId', '_id name email jobTitle profilePic')
        .populate('adminId', '_id name email jobTitle profilePic')
        .exec();
      logger.info(`Fetched ${groups.length} groups for userId: ${userId}`);
      return groups;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group details for userId ${userId}`, err);
      throw new RepositoryError('Error fetching group details by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }


  public getAllGroupRequests = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<IGroupRequest[]> => {
  try {
    const allRequests = await this._groupRequestModel
      .find()
      .populate({
        path: "groupId",
        model: "Group",
        populate: {
          path: "members.userId",
          model: "User",
          select: "_id name email jobTitle profilePic",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "_id name email jobTitle profilePic",
      })
      .sort({ createdAt: -1 })
      .exec();

    let filteredRequests = allRequests;

    if (search.trim()) {
      const regex = new RegExp(search, "i");

      filteredRequests = allRequests.filter((req) => {
        const groupName = (req as any).groupId?.name || "";
        const userName = (req as any).userId?.name || "";
        const userEmail = (req as any).userId?.email || "";

        return (
          regex.test(groupName) ||
          regex.test(userName) ||
          regex.test(userEmail)
        );
      });
    }

    const total = filteredRequests.length;
    const paginated = filteredRequests.slice((page - 1) * limit, page * limit);

    logger.info(`Fetched ${paginated.length} group requests (total=${total})`);
    return Object.assign(paginated, { total });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching group requests", err);
    throw new RepositoryError(
      "Error fetching group requests",
      StatusCodes.INTERNAL_SERVER_ERROR,
      err
    );
  }
};


  public isUserInGroup = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      logger.debug(`Checking if user ${userId} is in group ${groupId}`);
      const group = await this.model
        .findOne({ _id: this.toObjectId(groupId), 'members.userId': this.toObjectId(userId) })
        .exec();
      const isInGroup = !!group;
      logger.info(`User ${userId} is ${isInGroup ? '' : 'not '}in group ${groupId}`);
      return isInGroup;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking group membership for user ${userId} in group ${groupId}`, err);
      throw new RepositoryError('Error checking group membership', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getGroupMembers = async (groupId: string): Promise<Types.ObjectId[]> => {
      try {
        logger.debug(`Fetching group members for group: ${groupId}`);
        const group = await this.model.findById(this.toObjectId(groupId))
          .select("members")
          .exec();
        if (!group) {
          logger.warn(`Group not found: ${groupId}`);
          throw new RepositoryError(`Group not found with ID: ${groupId}`, StatusCodes.NOT_FOUND);
        }
        const members = group.members.map((member) => {
        const userId =
          typeof member.userId === "string"
            ? member.userId
            : member.userId instanceof Types.ObjectId
            ? member.userId
            : member.userId._id; // if it's IUser, take its _id

          return this.toObjectId(userId);
        });
        logger.info(`Fetched ${members.length} members for group: ${groupId}`);
        return members;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error fetching group members for group ${groupId}`, err);
        throw new RepositoryError('Error fetching group members', StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    }
}