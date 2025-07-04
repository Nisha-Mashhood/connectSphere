import { BaseService } from "../../../core/Services/BaseService";
import { GroupRepository } from "../Repositry/GroupRepositry";
import { ContactRepository } from "../../Contact/Repositry/ContactRepositry";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import { sendEmail } from "../../../core/Utils/Email";
import stripe from "../../../core/Utils/Stripe";
import { v4 as uuid } from "uuid";
import logger from "../../../core/Utils/Logger";
import { GroupDocument } from "../../../Interfaces/models/GroupDocument";
import { GroupRequestDocument } from "../../../Interfaces/models/GroupRequestDocument";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import { GroupFormData } from "../Types/types";
import { Types } from "mongoose";

export class GroupService extends BaseService {
  private groupRepo: GroupRepository;
  private contactRepo: ContactRepository;
  private userRepo: UserRepository;

  constructor() {
    super();
    this.groupRepo = new GroupRepository();
    this.contactRepo = new ContactRepository();
    this.userRepo = new UserRepository();
  }

  createGroup = async (groupData: GroupFormData): Promise<GroupDocument> => {
    logger.debug(`Creating group: ${groupData.name}`);
    this.checkData(groupData);
    if (
      !groupData.name ||
      !groupData.bio ||
      !groupData.adminId ||
      !groupData.startDate
    ) {
      throw new ServiceError(
        "Missing required fields: name, bio, adminId, or startDate"
      );
    }
    if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
      throw new ServiceError("At least one available slot is required");
    }
    if (groupData.maxMembers > 4) {
      throw new ServiceError("Maximum members cannot exceed 4");
    }
    logger.info("Group data : ", groupData);
    // const newGroup = await this.groupRepo.createGroup({
    //   ...groupData,
    //   createdAt: new Date(),
    // });
    // logger.info("Created Group : ", newGroup);

    // await this.contactRepo.createContact({
    //   userId: groupData.adminId,
    //   groupId: newGroup._id.toString(),
    //   type: 'group',
    // });
    // return newGroup;

    // Validate adminId
    if (!Types.ObjectId.isValid(groupData.adminId)) {
      throw new ServiceError("Invalid adminId: must be a valid ObjectId");
    }

    // Validate members
    if (
      groupData.members &&
      groupData.members.some((id) => !Types.ObjectId.isValid(id))
    ) {
      throw new ServiceError(
        "Invalid member ID: all member IDs must be valid ObjectIds"
      );
    }

    const newGroup = await this.groupRepo.createGroup({
      ...groupData,
      members: groupData.members || [],
    });
    logger.info("Created Group : ", newGroup);

    await this.contactRepo.createContact({
      userId: groupData.adminId,
      groupId: newGroup._id.toString(),
      type: "group",
    });
    return newGroup;
  };

  getGroupDetails = async (adminId: string): Promise<GroupDocument[]> => {
    logger.debug(`Fetching groups for admin: ${adminId}`);
    this.checkData(adminId);
    return await this.groupRepo.getGroupsByAdminId(adminId);
  };

  getGroupById = async (groupId: string): Promise<GroupDocument | null> => {
    logger.debug(`Fetching group by ID: ${groupId}`);
    this.checkData(groupId);
    return await this.groupRepo.getGroupById(groupId);
  };

  getAllGroups = async (): Promise<GroupDocument[]> => {
    logger.debug("Fetching all groups");
    return await this.groupRepo.getAllGroups();
  };

  requestToJoinGroup = async (
    groupId: string,
    userId: string
  ): Promise<GroupRequestDocument> => {
    logger.debug(
      `Creating group request for group: ${groupId}, user: ${userId}`
    );
    this.checkData({ groupId, userId });
    return await this.groupRepo.createGroupRequest({ groupId, userId });
  };

  getGroupRequestsByGroupId = async (
    groupId: string
  ): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for group: ${groupId}`);
    this.checkData(groupId);
    return await this.groupRepo.getGroupRequestsByGroupId(groupId);
  };

  getGroupRequestsByAdminId = async (
    adminId: string
  ): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for admin: ${adminId}`);
    this.checkData(adminId);
    return await this.groupRepo.getGroupRequestsByAdminId(adminId);
  };

  getGroupRequestsByUserId = async (
    userId: string
  ): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for user: ${userId}`);
    this.checkData(userId);
    return await this.groupRepo.getGroupRequestsByUserId(userId);
  };

  getGroupRequestById = async (
    requestId: string
  ): Promise<GroupRequestDocument | null> => {
    logger.debug(`Fetching group request by ID: ${requestId}`);
    this.checkData(requestId);
    return await this.groupRepo.findGroupRequestById(requestId);
  };

  //Accept the Request or Reject the request
  modifyGroupRequestStatus = async (
    requestId: string,
    status: "Accepted" | "Rejected"
  ): Promise<{
    message: string;
    requiresPayment?: boolean;
    groupPrice?: number;
    groupId?: string;
  }> => {
    logger.debug(
      `Modifying group request status: ${requestId} to ${status} :- Service`
    );
    this.checkData({ requestId, status });

    // Verify requestId is valid
    if (!Types.ObjectId.isValid(requestId)) {
      logger.error(`Invalid requestId: ${requestId}`);
      throw new ServiceError("Invalid requestId: must be a valid ObjectId");
    }

    const request = await this.groupRepo.findGroupRequestById(requestId);
    if (!request) {
      logger.error(`Group request not found for ID: ${requestId}`);
      // return { message: "User added to group" };
      throw new ServiceError("No Requset Found");
    } else {
      logger.error(`Group request found for ID: ${requestId} is: ${request}`);
    }

    if (!request.groupId?._id) {
      logger.error(`Group ID not found in request: ${requestId}`);
      throw new ServiceError("Group ID not found in request");
    }
    if (!request.userId?._id) {
      logger.error(`User ID not found in request: ${requestId}`);
      throw new ServiceError("User ID not found in request");
    }

    const group = await this.groupRepo.getGroupById(
      request.groupId._id.toString()
    );
    logger.info("THE GROUP FOUND : ",group);

    if (!group) {
      logger.error(`Group not found for ID: ${request.groupId._id}`);
      throw new ServiceError("Group not found");
    } 

    if (status === "Accepted") {
      if (group.isFull || group.members.length >= group.maxMembers) {
        logger.error(
          `Cannot accept request for group ${group._id}: Group is full`
        );
        throw new ServiceError(
          "Cannot accept request. Group is full (maximum 4 members)"
        );
      }

      // Update request status to Accepted
      await this.groupRepo.updateGroupRequestStatus(requestId, "Accepted");

      if (group.price > 0) {
        return {
          message: "Request accepted. Awaiting payment",
          requiresPayment: true,
          groupPrice: group.price,
          groupId: group._id.toString(),
        };
      } else {
        //add member to the group
        await this.groupRepo.addMemberToGroup(
          group._id.toString(),
          request.userId._id.toString()
        );

        //create the contact
        await this.contactRepo.createContact({
          userId: request.userId._id.toString(),
          groupId: group._id.toString(),
          type: "group",
        });

        //delete the group request
        await this.groupRepo.deleteGroupRequest(requestId);

        const updatedGroup = await this.groupRepo.getGroupById(
          group._id.toString()
        );
        logger.debug(
          `Updated group members: ${JSON.stringify(updatedGroup?.members)}`
        );

        if (!updatedGroup) {
          logger.error(
            `Failed to fetch updated group ${group._id} after adding member`
          );
          throw new ServiceError("Failed to fetch updated group");
        }

        const userInGroup = updatedGroup.members.some((m) => {
          const memberUserId = m.userId?._id?.toString();
          return memberUserId === request.userId._id.toString();
        });

        if (!userInGroup) {
          logger.error(
            `User ${request.userId._id} not found in group ${group._id} members after addition`
          );
          throw new ServiceError("Failed to add member to group");
        }

        return { message: "User added to group successfully" };
      }
    } else {
      // Update request status to Rejected and keep the request
      await this.groupRepo.updateGroupRequestStatus(requestId, "Rejected");
      return { message: "Request rejected successfully" };
    }
  };

  processGroupPayment = async (
    paymentMethodId: string | { id: string },
    amount: number,
    requestId: string,
    email: string,
    groupRequestData: { groupId: string; userId: string },
    returnUrl: string
  ): Promise<{ paymentIntent: any }> => {
    logger.debug(`Processing payment for group request: ${requestId}`);
    this.checkData({
      paymentMethodId,
      amount,
      requestId,
      email,
      groupRequestData,
      returnUrl,
    });

    const request = await this.groupRepo.findGroupRequestById(requestId);
    if (!request) {
      throw new ServiceError("Group request not found");
    }
    const group = await this.groupRepo.getGroupById(request.groupId._id.toString());
    if (!group) {
      throw new ServiceError("Group not found");
    }
    if (group.isFull || group.members.length >= group.maxMembers) {
      throw new ServiceError(
        "Cannot complete payment. Group is full (maximum 4 members)"
      );
    }

    const paymentMethodIdString =
      typeof paymentMethodId === "string"
        ? paymentMethodId
        : paymentMethodId.id;
    if (!paymentMethodIdString) {
      throw new ServiceError("Invalid paymentMethodId");
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
      await this.groupRepo.updateGroupPaymentStatus(requestId, amount / 100);
      await this.groupRepo.addMemberToGroup(
        groupRequestData.groupId,
        groupRequestData.userId
      );
      await this.contactRepo.createContact({
        userId: groupRequestData.userId,
        groupId: groupRequestData.groupId,
        type: "group",
      });
      await this.groupRepo.deleteGroupRequest(requestId);
    }

    return { paymentIntent };
  };

  removeGroupMember = async (
    groupId: string,
    userId: string
  ): Promise<GroupDocument> => {
    logger.debug(`Removing user ${userId} from group ${groupId}`);
    this.checkData({ groupId, userId });
    const group = await this.groupRepo.getGroupById(groupId);
    if (!group) {
      throw new ServiceError("Group not found");
    }
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ServiceError("User not found");
    }
    const userInGroup = group.members.some((m) =>
      m.userId instanceof Types.ObjectId
        ? m.userId.toString() === userId
        : (m.userId as any)?._id?.toString() === userId
    );

    if (!userInGroup) {
      logger.error(`User ${userId} not found in group ${groupId}`);
      throw new ServiceError('User not found in group');
    }

    await this.groupRepo.removeGroupMember(groupId, userId); //after removing delete the conatct also
    await this.contactRepo.deleteContact(groupId, 'group', userId);
    
    const updatedGroup = await this.groupRepo.getGroupById(groupId);
    if (!updatedGroup) {
      logger.error(`Failed to fetch updated group ${groupId} after removing member`);
      throw new ServiceError('Failed to fetch updated group');
    }

    const userStillInGroup = updatedGroup.members.some((m) =>
      m.userId instanceof Types.ObjectId
        ? m.userId.toString() === userId
        : (m.userId as any)?._id?.toString() === userId
    );

    if (userStillInGroup) {
      logger.error(`Failed to remove user ${userId} from group ${groupId}`);
      throw new ServiceError('Failed to remove user from group');
    }

    logger.info(`User ${userId} removed from group ${groupId} and contact deleted`);


    const subject = `You have been removed from the group "${group.name}"`;
    const text = `Hi ${user.name},\n\nWe wanted to inform you that you have been removed from the group "${group.name}" on ConnectSphere.\n\nIf you believe this was a mistake or have any questions, feel free to reach out to our support team.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(user.email, subject, text);
    logger.info(`Removal email sent to: ${user.email}`);
    return updatedGroup;
  };

  deleteGroup = async (groupId: string): Promise<GroupDocument | null> => {
    logger.debug(`Deleting group: ${groupId}`);
    this.checkData(groupId);
    const group = await this.groupRepo.getGroupById(groupId);
    if (!group) {
      logger.error(`Group not found for ID: ${groupId}`);
      throw new ServiceError("Group not found");
    }
    await this.groupRepo.deleteGroupRequestsByGroupId(groupId); //delete requset associated with that group
    await this.contactRepo.deleteContact(groupId, 'group'); //delete contact associated with taht group

    logger.info(`Group ${groupId} deleted and associated contacts removed`);
    return await this.groupRepo.deleteGroupById(groupId); //finally remove the whole group
  };

  updateGroupImage = async (
    groupId: string,
    profilePic?: string,
    coverPic?: string
  ): Promise<GroupDocument | null> => {
    logger.debug(`Updating group image for group: ${groupId}`);
    this.checkData(groupId);
    const updateData: { profilePic?: string; coverPic?: string } = {};
    if (profilePic) updateData.profilePic = profilePic;
    if (coverPic) updateData.coverPic = coverPic;
    if (Object.keys(updateData).length === 0) {
      throw new ServiceError("No image data provided");
    }
    return await this.groupRepo.updateGroupImage(groupId, updateData);
  };

  getGroupDetailsForMembers = async (
    userId: string
  ): Promise<GroupDocument[]> => {
    logger.debug(`Fetching group details for member: ${userId}`);
    this.checkData(userId);
    const groups = await this.groupRepo.getGroupDetailsByUserId(userId);
    if (!groups || groups.length === 0) {
      throw new ServiceError("User is not a member of any groups");
    }
    return groups;
  };

  getAllGroupRequests = async (): Promise<GroupRequestDocument[]> => {
    logger.debug("Fetching all group requests");
    return await this.groupRepo.getAllGroupRequests();
  };
}
