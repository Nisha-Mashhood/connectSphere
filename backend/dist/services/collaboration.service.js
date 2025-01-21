import { createCollaboration, createTemporaryRequest, deleteMentorRequest, getCollabDataForMentor, getCollabDataForUser, getMentorRequestsByMentorId, getRequestByUserId, updateMentorRequestStatus } from "../repositories/collaboration.repositry.js";
import stripe from '../utils/stripe.utils.js';
import { v4 as uuid } from 'uuid';
export const TemporaryRequestService = async (requestData) => {
    try {
        const newRequest = await createTemporaryRequest({
            ...requestData,
            paymentStatus: "Pending",
            isAccepted: "Pending",
        });
        return newRequest;
    }
    catch (error) {
        throw new Error(`Error creating temporary request: ${error.message}`);
    }
};
// Fetch all requests for a mentor
export const getMentorRequests = async (mentorId) => {
    try {
        const request = await getMentorRequestsByMentorId(mentorId);
        return request;
    }
    catch (error) {
        throw new Error(`Error fetching mentor requests: ${error.message}`);
    }
};
// Accept a mentor request
export const acceptRequest = async (requestId) => {
    try {
        return await updateMentorRequestStatus(requestId, "Accepted");
    }
    catch (error) {
        throw new Error(`Error accepting mentor request: ${error.message}`);
    }
};
// Reject a mentor request
export const rejectRequest = async (requestId) => {
    try {
        return await updateMentorRequestStatus(requestId, "Rejected");
    }
    catch (error) {
        throw new Error(`Error rejecting mentor request: ${error.message}`);
    }
};
// get requset for the user
export const getRequsetForUser = async (userId) => {
    try {
        return await getRequestByUserId(userId);
    }
    catch (error) {
        throw new Error(`Error in retrieving request: ${error.message}`);
    }
};
//make payemnt using stripe
export const processPaymentService = async (token, amount, requestId, mentorRequestData) => {
    const idempotencyKey = uuid();
    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });
        const charge = await stripe.charges.create({
            amount,
            currency: 'inr',
            customer: customer.id,
            receipt_email: token.email,
            description: `Payment for Request ID: ${requestId}`,
        }, { idempotencyKey });
        if (charge.status === 'succeeded') {
            // Calculate dates
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 30); // Add 30 days
            // Create a collaboration document
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
            // Delete the mentor request document
            await deleteMentorRequest(requestId);
        }
        return charge;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
//Get collab data for user
export const getCollabDataForUserService = async (userId) => {
    try {
        const collabData = await getCollabDataForUser(userId);
        return collabData;
    }
    catch (error) {
        throw new Error(`Error getting collaboration data for user: ${error.message}`);
    }
};
//get collab data for mentor
export const getCollabDataForMentorService = async (mentorId) => {
    try {
        const collabData = await getCollabDataForMentor(mentorId);
        return collabData;
    }
    catch (error) {
        throw new Error(`Error getting collaboration data for mentor: ${error.message}`);
    }
};
//# sourceMappingURL=collaboration.service.js.map