import { BaseService } from '../../../core/Services/BaseService';
import { GroupRepository } from '../Repositry/GroupRepositry';
import { ContactRepository } from '../../Contact/Repositry/ContactRepositry';
import { UserRepository } from '../../Auth/Repositry/UserRepositry';
import { sendEmail } from '../../../core/Utils/Email';
import stripe from '../../../core/Utils/Stripe';
import { v4 as uuid } from 'uuid';
import logger from '../../../core/Utils/Logger';
import { GroupDocument } from '../../../Interfaces/models/GroupDocument';
import { GroupRequestDocument } from '../../../Interfaces/models/GroupRequestDocument';
import { ServiceError } from '../../../core/Utils/ErrorHandler';
import { GroupFormData } from '../Types/types';

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

   createGroup = async(groupData: GroupFormData): Promise<GroupDocument> =>{
    logger.debug(`Creating group: ${groupData.name}`);
    this.checkData(groupData);
    if (!groupData.name || !groupData.bio || !groupData.adminId || !groupData.startDate) {
      throw new ServiceError('Missing required fields: name, bio, adminId, or startDate');
    }
    if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
      throw new ServiceError('At least one available slot is required');
    }
    if (groupData.maxMembers > 4) {
      throw new ServiceError('Maximum members cannot exceed 4');
    }
    const newGroup = await this.groupRepo.createGroup({
      ...groupData,
      createdAt: new Date(),
    });
    
    await this.contactRepo.createContact({
      userId: groupData.adminId,
      groupId: newGroup._id.toString(),
      type: 'group',
    });
    return newGroup;
  }

   getGroupDetails = async(adminId: string): Promise<GroupDocument[]> => {
    logger.debug(`Fetching groups for admin: ${adminId}`);
    this.checkData(adminId);
    return await this.groupRepo.getGroupsByAdminId(adminId);
  }

   getGroupById = async(groupId: string): Promise<GroupDocument | null> => {
    logger.debug(`Fetching group by ID: ${groupId}`);
    this.checkData(groupId);
    return await this.groupRepo.getGroupById(groupId);
  }

   getAllGroups = async(): Promise<GroupDocument[]> => {
    logger.debug('Fetching all groups');
    return await this.groupRepo.getAllGroups();
  }

   requestToJoinGroup = async(groupId: string, userId: string): Promise<GroupRequestDocument> =>{
    logger.debug(`Creating group request for group: ${groupId}, user: ${userId}`);
    this.checkData({ groupId, userId });
    return await this.groupRepo.createGroupRequest({ groupId, userId });
  }

   getGroupRequestsByGroupId = async(groupId: string): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for group: ${groupId}`);
    this.checkData(groupId);
    return await this.groupRepo.getGroupRequestsByGroupId(groupId);
  }

   getGroupRequestsByAdminId = async(adminId: string): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for admin: ${adminId}`);
    this.checkData(adminId);
    return await this.groupRepo.getGroupRequestsByAdminId(adminId);
  }

   getGroupRequestsByUserId = async(userId: string): Promise<GroupRequestDocument[]> => {
    logger.debug(`Fetching group requests for user: ${userId}`);
    this.checkData(userId);
    return await this.groupRepo.getGroupRequestsByUserId(userId);
  }

   getGroupRequestById = async(requestId: string): Promise<GroupRequestDocument | null> => {
    logger.debug(`Fetching group request by ID: ${requestId}`);
    this.checkData(requestId);
    return await this.groupRepo.findGroupRequestById(requestId);
  }

   modifyGroupRequestStatus = async(
    requestId: string,
    status: 'Accepted' | 'Rejected'
  ): Promise<{ message: string }> => {
    logger.debug(`Modifying group request status: ${requestId} to ${status}`);
    this.checkData({ requestId, status });
    const request = await this.groupRepo.findGroupRequestById(requestId);
    if (!request) {
      throw new ServiceError('Group request not found');
    }
    const group = await this.groupRepo.getGroupById(request.groupId.toString());
    if (!group) {
      throw new ServiceError('Group not found');
    }
    if (status === 'Accepted') {
      if (group.isFull || group.members.length >= group.maxMembers) {
        throw new ServiceError('Cannot accept request. Group is full (maximum 4 members)');
      }
      await this.groupRepo.updateGroupRequestStatus(requestId, 'Accepted');
      if (group.price > 0) {
        return { message: 'Request accepted. Awaiting payment' };
      } else {
        await this.groupRepo.addMemberToGroup(group._id.toString(), request.userId.toString());
        await this.contactRepo.createContact({
          userId: request.userId.toString(),
          groupId: group._id.toString(),
          type: 'group',
        });
        await this.groupRepo.deleteGroupRequest(requestId);
        const updatedGroup = await this.groupRepo.getGroupById(group._id.toString());
        if (
          !updatedGroup?.members.some((m) => m.userId.toString() === request.userId.toString())
        ) {
          throw new ServiceError('Failed to add member to group');
        }
        return { message: 'User added to group successfully' };
      }
    } else {
      await this.groupRepo.updateGroupRequestStatus(requestId, 'Rejected');
      return { message: 'Request rejected successfully' };
    }
  }

   processGroupPayment = async(
    paymentMethodId: string | { id: string },
    amount: number,
    requestId: string,
    email: string,
    groupRequestData: { groupId: string; userId: string },
    returnUrl: string
  ): Promise<{ paymentIntent: any }> => {
    logger.debug(`Processing payment for group request: ${requestId}`);
    this.checkData({ paymentMethodId, amount, requestId, email, groupRequestData, returnUrl });

    const request = await this.groupRepo.findGroupRequestById(requestId);
    if (!request) {
      throw new ServiceError('Group request not found');
    }
    const group = await this.groupRepo.getGroupById(request.groupId.toString());
    if (!group) {
      throw new ServiceError('Group not found');
    }
    if (group.isFull || group.members.length >= group.maxMembers) {
      throw new ServiceError('Cannot complete payment. Group is full (maximum 4 members)');
    }

    const paymentMethodIdString =
      typeof paymentMethodId === 'string' ? paymentMethodId : paymentMethodId.id;
    if (!paymentMethodIdString) {
      throw new ServiceError('Invalid paymentMethodId');
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
        currency: 'inr',
        customer: customer.id,
        payment_method: paymentMethodIdString,
        confirm: true,
        description: `Payment for Group Request ID: ${requestId}`,
        receipt_email: email,
        metadata: { requestId, groupId: groupRequestData.groupId, userId: groupRequestData.userId },
        return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
      },
      { idempotencyKey }
    );

    if (paymentIntent.status === 'succeeded') {
      await this.groupRepo.updateGroupPaymentStatus(requestId, amount / 100);
      await this.groupRepo.addMemberToGroup(groupRequestData.groupId, groupRequestData.userId);
      await this.contactRepo.createContact({
        userId: groupRequestData.userId,
        groupId: groupRequestData.groupId,
        type: 'group',
      });
      await this.groupRepo.deleteGroupRequest(requestId);
    }

    return { paymentIntent };
  }

   removeGroupMember = async(groupId: string, userId: string): Promise<GroupDocument> => {
    logger.debug(`Removing user ${userId} from group ${groupId}`);
    this.checkData({ groupId, userId });
    const group = await this.groupRepo.getGroupById(groupId);
    if (!group) {
      throw new ServiceError('Group not found');
    }
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ServiceError('User not found');
    }
    const updatedGroup = await this.groupRepo.removeGroupMember(groupId, userId);
    if (!updatedGroup) {
      throw new ServiceError('Failed to remove member from group');
    }
    const subject = `You have been removed from the group "${group.name}"`;
    const text = `Hi ${user.name},\n\nWe wanted to inform you that you have been removed from the group "${group.name}" on ConnectSphere.\n\nIf you believe this was a mistake or have any questions, feel free to reach out to our support team.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(user.email, subject, text);
    logger.info(`Removal email sent to: ${user.email}`);
    return updatedGroup;
  }

   deleteGroup = async(groupId: string): Promise<GroupDocument | null> => {
    logger.debug(`Deleting group: ${groupId}`);
    this.checkData(groupId);
    const group = await this.groupRepo.getGroupById(groupId);
    if (!group) {
      throw new ServiceError('Group not found');
    }
    await this.groupRepo.deleteGroupRequestsByGroupId(groupId);
    return await this.groupRepo.deleteGroupById(groupId);
  }

   updateGroupImage = async(
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
      throw new ServiceError('No image data provided');
    }
    return await this.groupRepo.updateGroupImage(groupId, updateData);
  }

   getGroupDetailsForMembers = async(userId: string): Promise<GroupDocument[]> =>{
    logger.debug(`Fetching group details for member: ${userId}`);
    this.checkData(userId);
    const groups = await this.groupRepo.getGroupDetailsByUserId(userId);
    if (!groups || groups.length === 0) {
      throw new ServiceError('User is not a member of any groups');
    }
    return groups;
  }

   getAllGroupRequests = async(): Promise<GroupRequestDocument[]> => {
    logger.debug('Fetching all group requests');
    return await this.groupRepo.getAllGroupRequests();
  }
}