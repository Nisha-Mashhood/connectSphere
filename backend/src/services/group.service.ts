import { sendEmail } from "../core/Utils/Email.js";
import {
  addMemberToGroup,
  createGroupRepository,
  deleteGroupById,
  deleteGroupRequest,
  deleteGroupRequestsByGroupId,
  findGrouptById,
  findRequestById,
  getAllGrouprequsets,
  // getAllGroups,
  // getGroupDeatilsById,
  getGroupRequestsByAdminId,
  getGroupRequestsByGroupId,
  getGroupRequestsByuserId,
  getGroupRequestById,
  getGroups,
  getGroupsByAdminId,
  getGroupsByGroupId,
  groupDetilsByUserId,
  GroupFormData,
  removeGroupMemberById,
  sendRequestToGroup,
  updateGroupImageRepositry,
  updateGroupPaymentStatus,
  updateGroupReqStatus,
  // updateGroupRequestStatus,
} from "../repositories/group.repositry.js";
import stripe from "../core/Utils/Stripe.js";
import { v4 as uuid } from "uuid";
import { Stripe } from "stripe";
import { findUserById } from "../repositories/user.repositry.js";
import { createContact } from "../repositories/contacts.repository.js";
import { GroupDocument } from "../Interfaces/models/GroupDocument.js";
import mongoose from "mongoose";

export const createGroupService = async (
  groupData: GroupFormData
): Promise<GroupDocument> => {
  if (
    !groupData.name ||
    !groupData.bio ||
    !groupData.adminId ||
    !groupData.startDate
  ) {
    throw new Error("Missing required fields: name, bio, or adminId");
  }

  if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
    throw new Error("At least one available slot is required");
  }
  if (groupData.maxMembers > 4) {
    throw new Error("Maximum members cannot exceed 4");
  }

  const groupPayload: GroupFormData = {
    ...groupData,
    createdAt: new Date(),
  };

  const newGroup: GroupDocument = await createGroupRepository(groupPayload);

  if (!newGroup) {
    throw new Error("No group created");
  }
  // console.log("newGroup:", newGroup);
  // console.log("newGroup._id:", newGroup._id);

  await createContact({
    userId: groupData.adminId,
    groupId: (newGroup._id as mongoose.Types.ObjectId).toString(),
    type: "group",
  });

  return newGroup;
};

//Get group details using adminId
export const fetchGroupDetails = async (adminId: string) => {
  try {
    // Fetch groups using the repository
    const groups = await getGroupsByAdminId(adminId);
    return groups;
  } catch (error: any) {
    throw new Error(`Error in service layer: ${error.message}`);
  }
};

//Get group details using groupId
export const fetchGroupDetailsService = async (groupId: any) => {
  try {
    // Fetch groups using the repository
    const groups = await getGroupsByGroupId(groupId);
    return groups;
  } catch (error: any) {
    throw new Error(`Error in group fetching: ${error.message}`);
  }
};

//Get all Groups
export const fetchGroups = async () => {
  try {
    // Fetch groups using the repository
    const groups = await getGroups();
    return groups;
  } catch (error: any) {
    throw new Error(`Error in service layer: ${error.message}`);
  }
};

//send requset to the group
export const requestToJoinGroup = async (groupId: string, userId: string) => {
  return await sendRequestToGroup({ groupId, userId });
};

//fetch group requset by groupId
export const fetchGroupRequestsByGroupId = async (groupId: string) => {
  return await getGroupRequestsByGroupId(groupId);
};

//fetch group requset by AdminId
export const fetchGroupRequestsByAdminId = async (adminId: string) => {
  return await getGroupRequestsByAdminId(adminId);
};

//fetch group requset by UserId
export const fetchGroupRequestsByuserId = async (userId: string) => {
  return await getGroupRequestsByuserId(userId);
};

//update the status to approved / rejected
export const modifyGroupRequestStatus = async (
  requestId: string,
  status: "Accepted" | "Rejected"
) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new Error("Group request not found.");
  }
  const group = await findGrouptById(request.groupId);
  if (!group) {
    throw new Error("Group not found.");
  }

  if (status === "Accepted") {
    // Verify group is not full
    if (group.isFull || group.members.length >= 4) {
      throw new Error(
        "Cannot accept request. Group is full (maximum 4 members)."
      );
    }

    await updateGroupReqStatus(requestId, "Accepted");

    if (group.price > 0) {
      return { message: "Request accepted. Awaiting payment." };
    } else {
      try {
        // Add member to group
        await addMemberToGroup(
          (group._id as any).toString(),
          request.userId.toString()
        );

        // Create contact
        await createContact({
          userId: request.userId.toString(),
          groupId: (group._id as any).toString(),
          type: "group",
        });

        // Delete the group request
        await deleteGroupRequest(requestId);

        // Verify member was added
        const updatedGroup = await findGrouptById(group._id);
        if (
          !updatedGroup?.members.some(
            (m) => m.userId.toString() === request.userId.toString()
          )
        ) {
          throw new Error("Failed to add member to group.");
        }

        return { message: "User added to group successfully." };
      } catch (error: any) {
        console.error("Error processing free group request:", error);
        throw new Error(`Failed to add member: ${error.message}`);
      }
    }
  } else if (status === "Rejected") {
    await updateGroupReqStatus(requestId, "Rejected");
    return { message: "Request rejected successfully." };
  }

  throw new Error("Invalid status.");
};

export const processGroupPaymentService = async (
  paymentMethodId: string | { id: string },
  amount: number,
  requestId: string,
  email: string,
  groupRequestData: { groupId: string; userId: string },
  returnUrl: string
) => {
  const idempotencyKey = uuid();

  try {
    const request = await findRequestById(requestId);
    if (!request) {
      throw new Error("Group request not found.");
    }
    const group = await findGrouptById(request.groupId);
    if (!group) {
      throw new Error("Group not found.");
    }
    if (group.isFull || group.members.length >= 4) {
      throw new Error(
        "Cannot complete payment. Group is full (maximum 4 members)."
      );
    }
    // Extract payment method ID if it's an object
    const paymentMethodIdString =
      typeof paymentMethodId === "string"
        ? paymentMethodId
        : paymentMethodId.id;
    if (!paymentMethodIdString || typeof paymentMethodIdString !== "string") {
      throw new Error("Invalid paymentMethodId");
    }

    console.log(
      `Processing payment with paymentMethodId: ${paymentMethodIdString}`
    );

    // List customers with email filter
    const customerListParams: Stripe.CustomerListParams = { email, limit: 1 };
    const customers = await stripe.customers.list(customerListParams);
    let customer: Stripe.Customer | null =
      customers.data.length > 0 ? customers.data[0] : null;

    if (!customer) {
      const customerCreateParams: Stripe.CustomerCreateParams = {
        email,
        payment_method: paymentMethodIdString,
        invoice_settings: { default_payment_method: paymentMethodIdString },
      };
      customer = await stripe.customers.create(customerCreateParams);
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
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
    };

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
      { idempotencyKey }
    );

    if (paymentIntent.status === "succeeded") {
      await updateGroupPaymentStatus(requestId, amount / 100);
      await addMemberToGroup(groupRequestData.groupId, groupRequestData.userId);

      await createContact({
        userId: groupRequestData.userId,
        groupId: groupRequestData.groupId,
        type: "group",
      });

      await deleteGroupRequest(requestId);
    }

    return paymentIntent;
  } catch (error: any) {
    console.error("Stripe payment error:", error);
    throw new Error(error.message || "Payment processing failed");
  }
};

export const removeMemberFromGroup = async (
  groupId: string,
  userId: string
) => {
  try {
    // Check if the group exists
    const group = await findGrouptById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if the user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Call the repository function to remove the user
    const updatedGroup = await removeGroupMemberById(groupId, userId);

    // Compose email details
    const subject = `You have been removed from the group "${group.name}"`;
    const text = `Hi ${user.name},

We wanted to inform you that you have been removed from the group "${group.name}" on ConnectSphere.

If you believe this was a mistake or have any questions, feel free to reach out to our support team.

Best regards,
ConnectSphere Team`;

    // Send email notification
    await sendEmail(user.email, subject, text);
    console.log(`Removal email sent to: ${user.email}`);

    return updatedGroup;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteGroupByIdService = async (groupId: string) => {
  // Check if the group exists
  const group = await findGrouptById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  // Delete all related group requests before deleting the group
  await deleteGroupRequestsByGroupId(groupId);

  // Call the repository function to delete the group
  const deletedGroup = await deleteGroupById(groupId);
  return deletedGroup;
};

//upload group images
export const updateGroupImageService = async (
  groupId: string,
  profilePic?: string,
  coverPic?: string
) => {
  const updateData: { profilePic?: string; coverPic?: string } = {};

  if (profilePic) updateData.profilePic = profilePic;
  if (coverPic) updateData.coverPic = coverPic;

  return await updateGroupImageRepositry(groupId, updateData);
};

//Get details of the group for the members of the group
export const groupDetilsForMembers = async (userId: string) => {
  try {
    const groupDetails = await groupDetilsByUserId(userId);
    if (!groupDetails) {
      throw new Error("User is not a member of any of the registered groups");
    }
    return groupDetails;
  } catch (error) {
    console.error("Error in GroupService:", error);
    throw new Error("Error retrieving group details");
  }
};

//  get all group requests
export const fetchAllGroupRequests = async () => {
  return await getAllGrouprequsets();
};

//  get group request details by request ID
export const fetchGroupRequestById = async (requestId: string) => {
  return await getGroupRequestById(requestId);
};
