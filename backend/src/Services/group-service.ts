import { inject, injectable } from "inversify";
import { sendEmail } from "../core/utils/email";
import stripe from "../core/utils/stripe";
import { v4 as uuid } from "uuid";
import logger from "../core/utils/logger";
import { ServiceError } from "../core/utils/error-handler";
import { GroupFormData, GroupQuery } from "../Utils/types/group-types";
import { Types } from "mongoose";
import { IGroupService } from "../Interfaces/Services/i-group-service";
import { StatusCodes } from "../enums/status-code-enums";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IGroupDTO } from "../Interfaces/DTOs/i-group-dto";
import { IGroupRequestDTO } from "../Interfaces/DTOs/i-group-request-dto";
import { toGroupDTO, toGroupDTOs } from "../Utils/mappers/group-mapper";
import { toGroupRequestDTO, toGroupRequestDTOs } from "../Utils/mappers/group-request-mapper";

@injectable()
export class GroupService implements IGroupService {
  private _groupRepository: IGroupRepository;
  private _contactRepository: IContactRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IGroupRepository') groupRepository : IGroupRepository,
    @inject('IContactRepository') contactRepository :IContactRepository,
    @inject('IUserRepository') userRepository : IUserRepository
  ) {
    this._groupRepository = groupRepository;
    this._contactRepository = contactRepository;
    this._userRepository = userRepository;
  }

  public createGroup = async (groupData: GroupFormData): Promise<IGroupDTO | null> => {
    try {
      logger.debug(`Creating group: ${groupData.name}`);

      if (
        !groupData.name ||
        !groupData.bio ||
        !groupData.adminId ||
        !groupData.startDate
      ) {
        logger.error(
          "Missing required fields: name, bio, adminId, or startDate"
        );
        throw new ServiceError(
          "Group name, bio, adminId, and startDate are required",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!Types.ObjectId.isValid(groupData.adminId)) {
        logger.error("Invalid adminId");
        throw new ServiceError(
          "Admin ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
        logger.error("No available slots provided");
        throw new ServiceError(
          "At least one available slot is required",
          StatusCodes.BAD_REQUEST
        );
      }

      if (groupData.maxMembers > 4) {
        logger.error("Maximum members exceeded");
        throw new ServiceError(
          "Maximum members cannot exceed 4",
          StatusCodes.BAD_REQUEST
        );
      }

      if (
        groupData.members &&
        groupData.members.some((id) => !Types.ObjectId.isValid(id))
      ) {
        logger.error("Invalid member ID in members array");
        throw new ServiceError(
          "All member IDs must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      const newGroup = await this._groupRepository.createGroup({
        ...groupData,
        members: groupData.members || [],
      });
      logger.info(`Created group: ${newGroup._id} (${newGroup.name})`);

      await this._contactRepository.createContact({
        userId: groupData.adminId,
        groupId: newGroup._id.toString(),
        type: "group",
      });
      logger.info(
        `Contact created for admin ${groupData.adminId} in group ${newGroup._id}`
      );

      return toGroupDTO(newGroup);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating group ${groupData.name}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create group",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupDetails = async (adminId: string): Promise<IGroupDTO[]> => {
    try {
      logger.debug(`Fetching groups for admin: ${adminId}`);

      if (!Types.ObjectId.isValid(adminId)) {
        logger.error("Invalid admin ID");
        throw new ServiceError(
          "Admin ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const groups = await this._groupRepository.getGroupsByAdminId(adminId);
      logger.info(`Fetched ${groups.length} groups for admin: ${adminId}`);
      return toGroupDTOs(groups);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching groups for admin ${adminId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch groups for admin",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupById = async (groupId: string): Promise<IGroupDTO | null> => {
    try {
      logger.debug(`Fetching group by ID: ${groupId}`);

      if (!Types.ObjectId.isValid(groupId)) {
        logger.error("Invalid group ID");
        throw new ServiceError(
          "Group ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const group = await this._groupRepository.getGroupById(groupId);
      if (!group) {
        logger.warn(`Group not found: ${groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Fetched group: ${groupId} (${group.name})`);
      return toGroupDTO(group);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group ${groupId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getAllGroups = async (
    query: GroupQuery = {}
  ): Promise<{ groups: IGroupDTO[]; total: number }> => {
    try {
      logger.debug(`Fetching all groups with query: ${JSON.stringify(query)}`);
      const result = await this._groupRepository.getAllGroups(query);
      // logger.debug(`Raw group data from repository: ${JSON.stringify(result.groups, null, 2)}`);
      logger.info(
        `Fetched ${result.groups} groups, total: ${result.total}`
      );
      return {
        groups: toGroupDTOs(result.groups),
        total:result.total
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all groups: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch all groups",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public requestToJoinGroup = async (
    groupId: string,
    userId: string
  ): Promise<IGroupRequestDTO> => {
    try {
      logger.debug(
        `Creating group request for group: ${groupId}, user: ${userId}`
      );

      if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(userId)) {
        logger.error("Invalid group ID or user ID");
        throw new ServiceError(
          "Group ID and User ID must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      const group = await this._groupRepository.getGroupById(groupId);
      if (!group) {
        logger.error(`Group not found: ${groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      const request = await this._groupRepository.createGroupRequest({
        groupId,
        userId,
      });
      logger.info(
        `Group request created: ${request._id} for group ${groupId}, user ${userId}`
      );
      return toGroupRequestDTO(request)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error creating group request for group ${groupId}, user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create group request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupRequestsByGroupId = async (
    groupId: string
  ): Promise<IGroupRequestDTO[]> => {
    try {
      logger.debug(`Fetching group requests for group: ${groupId}`);

      if (!Types.ObjectId.isValid(groupId)) {
        logger.error("Invalid group ID");
        throw new ServiceError(
          "Group ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const requests = await this._groupRepository.getGroupRequestsByGroupId(groupId);
      logger.info(
        `Fetched ${requests.length} group requests for group: ${groupId}`
      );
      return toGroupRequestDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching group requests for group ${groupId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group requests",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupRequestsByAdminId = async (
    adminId: string
  ): Promise<IGroupRequestDTO[]> => {
    try {
      logger.debug(`Fetching group requests for admin: ${adminId}`);

      if (!Types.ObjectId.isValid(adminId)) {
        logger.error("Invalid admin ID");
        throw new ServiceError(
          "Admin ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const requests = await this._groupRepository.getGroupRequestsByAdminId(adminId);
      logger.info(
        `Fetched ${requests.length} group requests for admin: ${adminId}`
      );
      return toGroupRequestDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching group requests for admin ${adminId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group requests for admin",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupRequestsByUserId = async (
    userId: string
  ): Promise<IGroupRequestDTO[]> => {
    try {
      logger.debug(`Fetching group requests for user: ${userId}`);

      if (!Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID");
        throw new ServiceError(
          "User ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const requests = await this._groupRepository.getGroupRequestsByUserId(userId);
      logger.info(
        `Fetched ${requests.length} group requests for user: ${userId}`
      );
      return toGroupRequestDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching group requests for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group requests for user",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupRequestById = async (
    requestId: string
  ): Promise<IGroupRequestDTO | null> => {
    try {
      logger.debug(`Fetching group request by ID: ${requestId}`);

      if (!Types.ObjectId.isValid(requestId)) {
        logger.error("Invalid request ID");
        throw new ServiceError(
          "Request ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const request = await this._groupRepository.findGroupRequestById(requestId);
      if (!request) {
        logger.warn(`Group request not found: ${requestId}`);
        throw new ServiceError(
          "Group request not found",
          StatusCodes.NOT_FOUND
        );
      }

      logger.info(`Fetched group request: ${requestId}`);
      return toGroupRequestDTO(request);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching group request ${requestId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  //Accept the Request or Reject the request
  public modifyGroupRequestStatus = async (
    requestId: string,
    status: "Accepted" | "Rejected"
  ): Promise<{
    message: string;
    requiresPayment?: boolean;
    groupPrice?: number;
    groupId?: string;
  }> => {
    try {
      logger.debug(`Modifying group request status: ${requestId} to ${status}`);

      if (!Types.ObjectId.isValid(requestId)) {
        logger.error("Invalid request ID");
        throw new ServiceError(
          "Request ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const validStatuses = ["Accepted", "Rejected"];
      if (!validStatuses.includes(status)) {
        logger.error(`Invalid status: ${status}`);
        throw new ServiceError(
          `Status must be one of: ${validStatuses.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const request = await this._groupRepository.findGroupRequestById(requestId);
      if (!request) {
        logger.error(`Group request not found: ${requestId}`);
        throw new ServiceError(
          "Group request not found",
          StatusCodes.NOT_FOUND
        );
      }

      if (!request.groupId?._id) {
        logger.error(`Group ID not found in request: ${requestId}`);
        throw new ServiceError(
          "Group ID not found in request",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!request.userId?._id) {
        logger.error(`User ID not found in request: ${requestId}`);
        throw new ServiceError(
          "User ID not found in request",
          StatusCodes.BAD_REQUEST
        );
      }

      const group = await this._groupRepository.getGroupById(
        request.groupId._id.toString()
      );
      if (!group) {
        logger.error(`Group not found: ${request.groupId._id}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      if (status === "Accepted") {
        if (group.isFull || group.members.length >= group.maxMembers) {
          logger.error(
            `Cannot accept request for group ${group._id}: Group is full`
          );
          throw new ServiceError(
            "Cannot accept request. Group is full (maximum 4 members)",
            StatusCodes.BAD_REQUEST
          );
        }

        await this._groupRepository.updateGroupRequestStatus(requestId, "Accepted");

        if (group.price > 0) {
          logger.info(`Group ${group._id} requires payment: ${group.price}`);
          return {
            message: "Request accepted. Awaiting payment",
            requiresPayment: true,
            groupPrice: group.price,
            groupId: group._id.toString(),
          };
        } else {
          await this._groupRepository.addMemberToGroup(
            group._id.toString(),
            request.userId._id.toString()
          );
          await this._contactRepository.createContact({
            userId: request.userId._id.toString(),
            groupId: group._id.toString(),
            type: "group",
          });
          await this._groupRepository.deleteGroupRequest(requestId);

          const updatedGroup = await this._groupRepository.getGroupById(
            group._id.toString()
          );
          if (!updatedGroup) {
            logger.error(
              `Failed to fetch updated group ${group._id} after adding member`
            );
            throw new ServiceError(
              "Failed to fetch updated group",
              StatusCodes.INTERNAL_SERVER_ERROR
            );
          }

          const userInGroup = updatedGroup.members.some((m) =>
            m.userId instanceof Types.ObjectId
              ? m.userId.toString() === request.userId._id.toString()
              : (m.userId as any)?._id?.toString() ===
                request.userId._id.toString()
          );

          if (!userInGroup) {
            logger.error(
              `User ${request.userId._id} not found in group ${group._id} members after addition`
            );
            throw new ServiceError(
              "Failed to add member to group",
              StatusCodes.INTERNAL_SERVER_ERROR
            );
          }

          logger.info(`User ${request.userId._id} added to group ${group._id}`);
          return { message: "User added to group successfully" };
        }
      } else {
        await this._groupRepository.updateGroupRequestStatus(requestId, "Rejected");
        logger.info(`Group request ${requestId} rejected`);
        return { message: "Request rejected successfully" };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error modifying group request ${requestId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to modify group request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public processGroupPayment = async (
    paymentMethodId: string | { id: string },
    amount: number,
    requestId: string,
    email: string,
    groupRequestData: { groupId: string; userId: string },
    returnUrl: string
  ): Promise<{ paymentIntent: any }> => {
    try {
      logger.debug(`Processing payment for group request: ${requestId}`);

      if (
        !Types.ObjectId.isValid(requestId) ||
        !Types.ObjectId.isValid(groupRequestData.groupId) ||
        !Types.ObjectId.isValid(groupRequestData.userId)
      ) {
        logger.error("Invalid request ID, group ID, or user ID");
        throw new ServiceError(
          "Request ID, Group ID, and User ID must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      if (amount <= 0) {
        logger.error("Invalid payment amount");
        throw new ServiceError(
          "Payment amount must be greater than 0",
          StatusCodes.BAD_REQUEST
        );
      }

      const request = await this._groupRepository.findGroupRequestById(requestId);
      if (!request) {
        logger.error(`Group request not found: ${requestId}`);
        throw new ServiceError(
          "Group request not found",
          StatusCodes.NOT_FOUND
        );
      }

      const group = await this._groupRepository.getGroupById(groupRequestData.groupId);
      if (!group) {
        logger.error(`Group not found: ${groupRequestData.groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      if (group.isFull || group.members.length >= group.maxMembers) {
        logger.error(
          `Cannot complete payment for group ${group._id}: Group is full`
        );
        throw new ServiceError(
          "Cannot complete payment. Group is full (maximum 4 members)",
          StatusCodes.BAD_REQUEST
        );
      }

      const paymentMethodIdString =
        typeof paymentMethodId === "string"
          ? paymentMethodId
          : paymentMethodId.id;
      if (!paymentMethodIdString) {
        logger.error("Invalid paymentMethodId");
        throw new ServiceError(
          "Invalid paymentMethodId",
          StatusCodes.BAD_REQUEST
        );
      }

      const idempotencyKey = uuid();
      let customers = await stripe.customers.list({ email, limit: 1 });
      let customer = customers.data.length > 0 ? customers.data[0] : null;

      if (!customer) {
        customer = await stripe.customers.create({
          email,
          payment_method: paymentMethodIdString,
          invoice_settings: { default_payment_method: paymentMethodIdString },
        });
        logger.info(`Created new Stripe customer for email: ${email}`);
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "inr",
          customer: customer.id,
          payment_method: paymentMethodIdString,
          confirm: true,
          description: `Payment for Group Request ID: ${requestId}`,
          receipt_email: email,
          metadata: {
            requestId,
            groupId: groupRequestData.groupId,
            userId: groupRequestData.userId,
          },
          return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
        },
        { idempotencyKey }
      );

      if (paymentIntent.status === "succeeded") {
        await this._groupRepository.updateGroupPaymentStatus(requestId, amount / 100);
        await this._groupRepository.addMemberToGroup(
          groupRequestData.groupId,
          groupRequestData.userId
        );
        await this._contactRepository.createContact({
          userId: groupRequestData.userId,
          groupId: groupRequestData.groupId,
          type: "group",
        });
        await this._groupRepository.deleteGroupRequest(requestId);
        logger.info(
          `Payment processed and user ${groupRequestData.userId} added to group ${groupRequestData.groupId}`
        );
      }

      return { paymentIntent };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error processing payment for group request ${requestId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to process group payment",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public removeGroupMember = async (
    groupId: string,
    userId: string
  ): Promise<IGroupDTO | null> => {
    try {
      logger.debug(`Removing user ${userId} from group ${groupId}`);

      if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(userId)) {
        logger.error("Invalid group ID or user ID");
        throw new ServiceError(
          "Group ID and User ID must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      const group = await this._groupRepository.getGroupById(groupId);
      if (!group) {
        logger.error(`Group not found: ${groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      const user = await this._userRepository.findById(userId);
      if (!user) {
        logger.error(`User not found: ${userId}`);
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      const userInGroup = group.members.some((m) =>
        m.userId instanceof Types.ObjectId
          ? m.userId.toString() === userId
          : (m.userId as any)?._id?.toString() === userId
      );

      if (!userInGroup) {
        logger.error(`User ${userId} not found in group ${groupId}`);
        throw new ServiceError(
          "User not found in group",
          StatusCodes.BAD_REQUEST
        );
      }

      await this._groupRepository.removeGroupMember(groupId, userId);
      await this._contactRepository.deleteContact(groupId, "group", userId);

      const updatedGroup = await this._groupRepository.getGroupById(groupId);
      if (!updatedGroup) {
        logger.error(
          `Failed to fetch updated group ${groupId} after removing member`
        );
        throw new ServiceError(
          "Failed to fetch updated group",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const userStillInGroup = updatedGroup.members.some((m) =>
        m.userId instanceof Types.ObjectId
          ? m.userId.toString() === userId
          : (m.userId as any)?._id?.toString() === userId
      );

      if (userStillInGroup) {
        logger.error(`Failed to remove user ${userId} from group ${groupId}`);
        throw new ServiceError(
          "Failed to remove user from group",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const subject = `You have been removed from the group "${group.name}"`;
      const text = `Hi ${user.name},\n\nWe wanted to inform you that you have been removed from the group "${group.name}" on ConnectSphere.\n\nIf you believe this was a mistake or have any questions, feel free to reach out to our support team.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(user.email, subject, text);
      logger.info(`Removal email sent to: ${user.email}`);

      logger.info(
        `User ${userId} removed from group ${groupId} and contact deleted`
      );
      return toGroupDTO(updatedGroup);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error removing user ${userId} from group ${groupId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to remove group member",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public deleteGroup = async (groupId: string): Promise<IGroupDTO | null> => {
    try {
      logger.debug(`Deleting group: ${groupId}`);

      if (!Types.ObjectId.isValid(groupId)) {
        logger.error("Invalid group ID");
        throw new ServiceError(
          "Group ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const group = await this._groupRepository.getGroupById(groupId);
      if (!group) {
        logger.error(`Group not found: ${groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      await this._groupRepository.deleteGroupRequestsByGroupId(groupId);
      await this._contactRepository.deleteContact(groupId, "group");
      const deletedGroup = await this._groupRepository.deleteGroupById(groupId);

      logger.info(
        `Group ${groupId} deleted and associated contacts and requests removed`
      );
      const deletedGroupDTO = toGroupDTO(deletedGroup);
      return deletedGroupDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting group ${groupId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to delete group",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public updateGroupImage = async (
    groupId: string,
    profilePic?: string,
    coverPic?: string
  ): Promise<IGroupDTO | null> => {
    try {
      logger.debug(`Updating group image for group: ${groupId}`);

      if (!Types.ObjectId.isValid(groupId)) {
        logger.error("Invalid group ID");
        throw new ServiceError(
          "Group ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const updateData: { profilePic?: string; coverPic?: string } = {};
      if (profilePic) updateData.profilePic = profilePic;
      if (coverPic) updateData.coverPic = coverPic;

      if (Object.keys(updateData).length === 0) {
        logger.error("No image data provided");
        throw new ServiceError(
          "No image data provided",
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedGroup = await this._groupRepository.updateGroupImage(
        groupId,
        updateData
      );
      if (!updatedGroup) {
        logger.warn(`Group not found: ${groupId}`);
        throw new ServiceError("Group not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Group image updated for group: ${groupId}`);
      return toGroupDTO(updatedGroup);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error updating group image for group ${groupId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update group image",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getGroupDetailsForMembers = async (
    userId: string
  ): Promise<IGroupDTO[]> => {
    try {
      logger.debug(`Fetching group details for member: ${userId}`);

      if (!Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID");
        throw new ServiceError(
          "User ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const groups = await this._groupRepository.getGroupDetailsByUserId(userId);
      logger.info(`Fetched ${groups.length} groups for member: ${userId}`);
      return toGroupDTOs(groups);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching group details for member ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch group details for member",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getAllGroupRequests = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<{ requests: IGroupRequestDTO[]; total: number }> => {
  try {
    logger.debug(`Service: fetching group requests (search="${search}")`);
    const result = await this._groupRepository.getAllGroupRequests(search, page, limit);

    const requests = toGroupRequestDTOs(result);
    const total = (result as any).total || requests.length;

    logger.info(`Service: fetched ${requests.length} group requests`);
    return { requests, total };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Service error in getAllGroupRequests: ${err.message}`);
    throw new ServiceError(
      "Failed to fetch group requests",
      StatusCodes.INTERNAL_SERVER_ERROR,
      err
    );
  }
};
}
