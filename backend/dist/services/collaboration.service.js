import { sendEmail } from "../core/Utils/Email.js";
import { createCollaboration, createTemporaryRequest, deleteMentorRequest, fetchMentorRequsetDetails, findCollab, findCollabById, findCollabDetails, findMentorRequest, getCollabDataForMentor, getCollabDataForUser, getLockedSlotsByMentorId, getMentorRequestsByMentorId, getRequestByUserId, markCollabAsCancelled, updateMentorRequestStatus, updateRequestStatus, updateTemporarySlotChanges, updateUnavailableDays, } from "../repositories/collaboration.repositry.js";
import stripe from "../core/Utils/Stripe.js";
import { v4 as uuid } from "uuid";
import { getMentorById } from "../repositories/mentor.repositry.js";
import { createContact } from "../repositories/contacts.repository.js";
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
export const processPaymentService = async (paymentMethodId, amount, requestId, mentorRequestData, email, returnUrl) => {
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
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "inr",
            customer: customer.id,
            payment_method: paymentMethodId,
            confirm: true,
            receipt_email: email,
            description: `Payment for Request ID: ${requestId}`,
            metadata: { requestId },
            return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
        }, { idempotencyKey });
        // If payment is successful, create a collaboration entry and delete mentor request
        if (paymentIntent.status === "succeeded") {
            const startDate = new Date();
            const endDate = new Date(startDate);
            // Number of sessions user is entitled to
            const totalSessions = mentorRequestData.timePeriod;
            console.log("total sessions:", totalSessions);
            // Find the weekly session day
            const sessionDay = mentorRequestData.selectedSlot?.day; // "Monday"
            let sessionCount = 0;
            // Loop until total sessions
            while (sessionCount < totalSessions) {
                endDate.setDate(endDate.getDate() + 1); // Move to the next day
                // Check if the current day matches the mentor's available session day
                if (endDate.toLocaleDateString("en-US", { weekday: "long" }) ===
                    sessionDay) {
                    sessionCount++; // incremennt the session
                }
            }
            const collaboration = await createCollaboration({
                mentorId: mentorRequestData.mentorId,
                userId: mentorRequestData.userId,
                selectedSlot: mentorRequestData.selectedSlot,
                price: amount / 100,
                payment: true,
                isCancelled: false,
                startDate,
                endDate,
            });
            // Fetch mentor details to get userId
            const mentor = await getMentorById(mentorRequestData.mentorId);
            if (!mentor || !mentor.userId) {
                throw new Error("Mentor or mentor's userId not found");
            }
            // Create two Contact entries and capture their results
            const [contact1, contact2] = await Promise.all([
                createContact({
                    userId: mentorRequestData.userId,
                    targetUserId: mentor.userId,
                    collaborationId: collaboration?._id,
                    type: "user-mentor",
                }),
                createContact({
                    userId: mentor.userId,
                    targetUserId: mentorRequestData.userId,
                    collaborationId: collaboration?._id,
                    type: "user-mentor",
                }),
            ]);
            //delete Mentor Requset collection
            await deleteMentorRequest(requestId);
            return { paymentIntent, contacts: [contact1, contact2] };
        }
        return paymentIntent;
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
//Delete collab
export const removecollab = async (collabId, reason) => {
    // Check if the group exists
    const collab = await findCollabById(collabId);
    if (!collab) {
        throw new Error("Collab not found");
    }
    const mentorEmail = collab.mentorId.userId?.email;
    const mentorName = collab.mentorId.userId?.name;
    const userName = collab.userId.name;
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
export const getMentorRequestsService = async ({ page, limit, search, }) => {
    try {
        return await findMentorRequest({ page, limit, search });
    }
    catch (error) {
        throw new Error(error.message);
    }
};
//For getting all collab details
export const getCollabsService = async ({ page, limit, search, }) => {
    try {
        return await findCollab({ page, limit, search });
    }
    catch (error) {
        throw new Error(error.message);
    }
};
//get the collab Details by collab Id
export const fetchCollabById = async (collabId) => {
    return await findCollabDetails(collabId);
};
//get the requset details by requset Id
export const fetchRequsetById = async (requestId) => {
    return await fetchMentorRequsetDetails(requestId);
};
// Service for updating unavailable days
export const markUnavailableDaysService = async (collabId, updateData) => {
    console.log("came to collaboartion service");
    try {
        const updatedCollaboartion = await updateUnavailableDays(collabId, updateData);
        console.log("Updated collaboartion from service file :", updatedCollaboartion);
        return updatedCollaboartion;
    }
    catch (error) {
        console.log("error in collaboartion service file :", error);
        throw new Error(`Service Error: ${error}`);
    }
};
// Service for updating temporary slot changes
export const updateTemporarySlotChangesService = async (collabId, updateData) => {
    try {
        const updatedCollaboartion = await updateTemporarySlotChanges(collabId, updateData);
        console.log("Updated collaboartion from service file :", updatedCollaboartion);
        return updatedCollaboartion;
    }
    catch (error) {
        console.log("error in collaboartion service file :", error);
        throw new Error(`Service Error: ${error}`);
    }
};
//service for updating the status
export const processTimeSlotRequest = async (collabId, requestId, isApproved, requestType) => {
    try {
        const status = isApproved ? "approved" : "rejected";
        // Fetch collaboration details with populated fields
        const collaboration = await findCollabById(collabId);
        if (!collaboration) {
            throw new Error("Collaboration not found");
        }
        // Determine who requested based on requestType and requestId
        let requestedBy;
        if (requestType === "unavailable") {
            const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
            if (!request) {
                throw new Error("Unavailable days request not found");
            }
            requestedBy = request.requestedBy;
        }
        else {
            const request = collaboration.temporarySlotChanges.find((req) => req._id.toString() === requestId);
            if (!request) {
                throw new Error("Time slot change request not found");
            }
            requestedBy = request.requestedBy;
        }
        if (!requestedBy) {
            throw new Error("Unable to determine who requested the change");
        }
        // Prepare data for update
        let newEndDate;
        if (requestType === "unavailable" && status === "approved") {
            const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
            if (request) {
                const unavailableDates = request.datesAndReasons.map((item) => new Date(item.date));
                const selectedDay = collaboration.selectedSlot[0].day;
                const currentEndDate = collaboration.endDate || collaboration.startDate;
                newEndDate = calculateNewEndDate(currentEndDate, unavailableDates, selectedDay);
            }
        }
        // Update the request status in the database
        const updatedCollaboration = await updateRequestStatus(collabId, requestId, requestType, status, newEndDate);
        console.log("Updated collaboration from service file:", updatedCollaboration);
        // Send email if the request is rejected
        if (status === "rejected") {
            const userEmail = collaboration.userId.email;
            const userName = collaboration.userId.name;
            const mentorEmail = collaboration.mentorId.userId.email;
            const mentorName = collaboration.mentorId.userId.name;
            if (!userEmail || !mentorEmail) {
                throw new Error("User or mentor email not found");
            }
            // Determine recipient and sender based on who requested
            const recipientEmail = requestedBy === "user" ? mentorEmail : userEmail;
            const recipientName = requestedBy === "user" ? mentorName : userName;
            const otherPartyName = requestedBy === "user" ? userName : mentorName;
            const subject = "Request Rejection Notice";
            const text = `Dear ${recipientName},

We regret to inform you that the request for ${requestType === "unavailable"
                ? "unavailable days"
                : "a time slot change"} in your mentorship session with ${otherPartyName} has been rejected.

If you have any questions, please contact support.

Best regards,
ConnectSphere Team`;
            await sendEmail(recipientEmail, subject, text);
            console.log(`Rejection email sent to ${requestedBy === "user" ? "mentor" : "user"}: ${recipientEmail}`);
        }
        return updatedCollaboration;
    }
    catch (error) {
        console.log("Error in service file:", error);
        throw new Error(`Failed to process time slot request: ${error.message}`);
    }
};
// Helper function to calculate new end date
const calculateNewEndDate = (currentEndDate, unavailableDates, selectedDay) => {
    const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
    };
    const selectedDayOfWeek = dayMap[selectedDay];
    const newEndDate = new Date(currentEndDate);
    const daysToAdd = unavailableDates.length;
    let currentDate = new Date(newEndDate);
    let sessionsAdded = 0;
    while (sessionsAdded < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() === selectedDayOfWeek) {
            sessionsAdded++;
        }
    }
    return currentDate;
};
//Find locked slot for mentor
export const getMentorLockedSlots = async (mentorId) => {
    try {
        if (!mentorId) {
            throw new Error("Mentor ID is required");
        }
        const lockedSlots = await getLockedSlotsByMentorId(mentorId);
        console.log(`Retrieved ${lockedSlots.length} locked slots for mentorId: ${mentorId}`);
        return lockedSlots;
    }
    catch (error) {
        console.log(`Error in service for mentorId ${mentorId}: ${error.message}`);
        throw new Error(`Failed to fetch locked slots: ${error.message}`);
    }
};
//# sourceMappingURL=collaboration.service.js.map