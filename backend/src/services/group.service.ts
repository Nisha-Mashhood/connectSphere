import { sendEmail } from "../utils/email.utils.js";
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
import stripe from "../utils/stripe.utils.js";
import { v4 as uuid } from "uuid";
import { findUserById } from "../repositories/user.repositry.js";

export const createGroupService = async (groupData: GroupFormData) => {
  if (!groupData.name || !groupData.bio || !groupData.adminId || !groupData.startDate) {
    throw new Error("Missing required fields: name, bio, or adminId");
  }

  if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
    throw new Error("At least one available slot is required");
  }

  // Process data if necessary
  const groupPayload = {
    ...groupData,
    createdAt: new Date(),
  };

  return await createGroupRepository(groupPayload);
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
export const fetchGroupDetailsService = async(groupId : any) =>{
  try {
   // Fetch groups using the repository
   const groups = await getGroupsByGroupId(groupId);
   return groups;
 } catch (error: any) {
   throw new Error(`Error in group fetching: ${error.message}`);
 }
}

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

  // Check if the group has space
  if (group.members.length >= group.maxMembers) {
    throw new Error("Cannot accept request. Group is full.");
  }

  if (status === "Accepted") {
    if (group.price > 0) {
      await updateGroupReqStatus(requestId, "Accepted");
      return;
    } else {
      // If no payment is required, add user to group and delete request
      await updateGroupReqStatus(requestId, "Accepted");
      await addMemberToGroup(
        (group._id as any).toString(),
        (request.userId as any).toString()
      );
      await deleteGroupRequest(requestId);
      return { message: "User added to group successfully." };
    }
  } else if (status === "Rejected") {
    return await updateGroupReqStatus(requestId, "Rejected");
  }

  throw new Error("Invalid status.");
};

export const processGroupPaymentService = async (
  paymentMethodId: string,
  amount: number,
  requestId: string,
  email: string,
  groupRequestData: { groupId: string; userId: string }
) => {
  // Generate a unique key for this transaction to prevent duplicate charges
  const idempotencyKey = uuid();

  try {
    // Create a customer in Stripe with payment_method instead of source
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      // Don't use source parameter as it's causing the error
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set the payment method as the default
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a PaymentIntent instead of a direct charge
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "inr",
        customer: customer.id,
        payment_method: paymentMethodId,
        confirm: true, // Confirm the payment immediately
        description: `Payment for Group Request ID: ${requestId}`,
        receipt_email: email,
        metadata: {
          requestId,
          groupId: groupRequestData.groupId,
          userId: groupRequestData.userId
        },
      },
      { idempotencyKey }
    );

    // If payment succeeded, update database records
    if (paymentIntent.status === "succeeded") {
      // Update group payment status to "Paid"
      await updateGroupPaymentStatus(requestId, amount / 100);
      
      // Add the user to the group as a member
      await addMemberToGroup(groupRequestData.groupId, groupRequestData.userId);
      
      // Delete the group request since payment is completed
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
  } catch (error : any) {
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
export const updateGroupImageService = async(groupId: string, profilePic?: string, coverPic?: string) =>{
  const updateData: { profilePic?: string; coverPic?: string } = {};

  if (profilePic) updateData.profilePic = profilePic;
  if (coverPic) updateData.coverPic = coverPic;

  return await updateGroupImageRepositry(groupId, updateData);
}

//Get details of the group for the members of the group
export const groupDetilsForMembers = async(userId: string) =>{
  try {
    const groupDetails = await groupDetilsByUserId(userId);
    if(!groupDetails){
      throw new Error("User is not a member of any of the registered groups");
    }
    return groupDetails;
  } catch (error) {
    console.error("Error in GroupService:", error);
    throw new Error("Error retrieving group details");
  }
}

//  get all group requests
export const fetchAllGroupRequests = async () => {
  return await getAllGrouprequsets();
};

//  get group request details by request ID
export const fetchGroupRequestById = async (requestId: string) => {
  return await getGroupRequestById(requestId);
};

