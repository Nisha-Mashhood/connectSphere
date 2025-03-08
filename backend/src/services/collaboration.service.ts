import { sendEmail } from "../utils/email.utils.js";
import {
  createCollaboration,
  createTemporaryRequest,
  deleteMentorRequest,
  fetchMentorRequsetDetails,
  findCollab,
  findCollabById,
  findCollabDetails,
  findMentorRequest,
  getCollabDataForMentor,
  getCollabDataForUser,
  getMentorRequestsByMentorId,
  getRequestByUserId,
  markCollabAsCancelled,
  updateMentorRequestStatus,
} from "../repositories/collaboration.repositry.js";
import stripe from "../utils/stripe.utils.js";
import { v4 as uuid } from "uuid";

export const TemporaryRequestService = async (requestData: any) => {
  try {
    const newRequest = await createTemporaryRequest({
      ...requestData,
      paymentStatus: "Pending",
      isAccepted: "Pending",
    });
    return newRequest;
  } catch (error: any) {
    throw new Error(`Error creating temporary request: ${error.message}`);
  }
};

// Fetch all requests for a mentor
export const getMentorRequests = async (mentorId: string) => {
  try {
    const request = await getMentorRequestsByMentorId(mentorId);
    return request;
  } catch (error: any) {
    throw new Error(`Error fetching mentor requests: ${error.message}`);
  }
};

// Accept a mentor request
export const acceptRequest = async (requestId: string) => {
  try {
    return await updateMentorRequestStatus(requestId, "Accepted");
  } catch (error: any) {
    throw new Error(`Error accepting mentor request: ${error.message}`);
  }
};

// Reject a mentor request
export const rejectRequest = async (requestId: string) => {
  try {
    return await updateMentorRequestStatus(requestId, "Rejected");
  } catch (error: any) {
    throw new Error(`Error rejecting mentor request: ${error.message}`);
  }
};

// get requset for the user
export const getRequsetForUser = async (userId: string) => {
  try {
    return await getRequestByUserId(userId);
  } catch (error: any) {
    throw new Error(`Error in retrieving request: ${error.message}`);
  }
};

//make payemnt using stripe
export const processPaymentService = async (
  paymentMethodId: string,
  amount: number,
  requestId: string,
  mentorRequestData: any,
  email: string,
  returnUrl: string
) => {
  const idempotencyKey = uuid();

  try {
    // Check if customer already exists, otherwise create one
    let customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data.length > 0 ? customers.data[0] : null;

    if (!customer) {
      customer = await stripe.customers.create({
        email: email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }, // Attach default payment method
      });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "inr",
        customer: customer.id,
        payment_method: paymentMethodId,
        confirm: true,
        receipt_email: email,
        description: `Payment for Request ID: ${requestId}`,
        metadata: { requestId },
        return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
        // Disable redirect based payment methods if you don't want 3DS or other redirects
        // Uncomment the below line to specifically disable redirects
        /* automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },*/
      },
      { idempotencyKey }
    );

    // If payment is successful, create a collaboration entry and delete mentor request
    if (paymentIntent.status === "succeeded") {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30); // 30-day access

      await createCollaboration({
        mentorId: mentorRequestData.mentorId,
        userId: mentorRequestData.userId,
        selectedSlot: mentorRequestData.selectedSlot,
        price: amount / 100,
        payment: true,
        isCancelled: false,
        startDate,
        endDate,
      });

      await deleteMentorRequest(requestId);
    }

    return paymentIntent;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

//Get collab data for user
export const getCollabDataForUserService = async (userId: string) => {
  try {
    const collabData = await getCollabDataForUser(userId);
    return collabData;
  } catch (error: any) {
    throw new Error(
      `Error getting collaboration data for user: ${error.message}`
    );
  }
};

//get collab data for mentor
export const getCollabDataForMentorService = async (mentorId: string) => {
  try {
    const collabData = await getCollabDataForMentor(mentorId);
    return collabData;
  } catch (error: any) {
    throw new Error(
      `Error getting collaboration data for mentor: ${error.message}`
    );
  }
};

//Delete collab
export const removecollab = async (collabId: string, reason: string) => {
  // Check if the group exists
  const collab = await findCollabById(collabId);
  if (!collab) {
    throw new Error("Collab not found");
  }

  // Ensure mentorId is an object, not a string
  if (typeof collab.mentorId === "string") {
    throw new Error("Mentor details are not populated properly.");
  }

  // Ensure userId in mentor is an object
  if (typeof collab.mentorId.userId === "string") {
    throw new Error("Mentor's user details are not populated properly.");
  }

  // Ensure userId is an object, not a string
  if (typeof collab.userId === "string") {
    throw new Error("User details are not populated properly.");
  }

  // Extract mentor details
  const mentorEmail = collab.mentorId?.userId?.email;
  const mentorName = collab.mentorId?.userId?.name;
  const userName = collab.userId?.name;

  if (!mentorEmail) {
    throw new Error("Mentor email not found");
  }

  // Send cancellation email
  const subject = "Mentorship Session Cancellation Notice";
  const text = `Dear ${mentorName},

  We regret to inform you that your mentorship session with ${userName} has been cancelled.
  Reason: ${reason}

  If you have any questions, please contact support.

  Best regards,
  ConnectSphere Team`;

  await sendEmail(mentorEmail, subject, text);

  console.log(`Cancellation email sent to mentor: ${mentorEmail}`);

  return await markCollabAsCancelled(collabId);
};

//FOR ADMIN
// Service to get all mentor requests
export const getMentorRequestsService = async () => {
  try {
    return await findMentorRequest();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Service to get all collaborations
export const getCollabsService = async () => {
  try {
    return await findCollab();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

//get the collab Details by collab Id
export const fetchCollabById = async (collabId: string) => {
  return await findCollabDetails(collabId);
};

//get the requset details by requset Id
export const fetchRequsetById = async (requestId: string) => {
  return await fetchMentorRequsetDetails(requestId);
};
