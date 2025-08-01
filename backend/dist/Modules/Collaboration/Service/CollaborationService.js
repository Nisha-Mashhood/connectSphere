import { BaseService } from "../../../core/Services/BaseService.js";
import { CollaborationRepository } from "../Repositry/CollaborationRepositry.js";
import { MentorRepository } from "../../Mentor/Repositry/MentorRepositry.js";
import { ContactRepository } from "../../Contact/Repositry/ContactRepositry.js";
import { sendEmail } from "../../../core/Utils/Email.js";
import stripe from "../../../core/Utils/Stripe.js";
import { v4 as uuid } from "uuid";
import logger from "../../../core/Utils/Logger.js";
import { ServiceError } from "../../../core/Utils/ErrorHandler.js";
export class CollaborationService extends BaseService {
    collabRepo;
    contactRepo;
    mentorRepo;
    constructor() {
        super();
        this.collabRepo = new CollaborationRepository();
        this.contactRepo = new ContactRepository();
        this.mentorRepo = new MentorRepository();
    }
    TemporaryRequestService = async (requestData) => {
        logger.debug(`Creating temporary request`);
        this.checkData(requestData);
        return await this.collabRepo.createTemporaryRequest({
            ...requestData,
            paymentStatus: "Pending",
            isAccepted: "Pending",
        });
    };
    getMentorRequests = async (mentorId) => {
        logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
        this.checkData(mentorId);
        return await this.collabRepo.getMentorRequestsByMentorId(mentorId);
    };
    acceptRequest = async (requestId) => {
        logger.debug(`Accepting mentor request: ${requestId}`);
        this.checkData(requestId);
        return await this.collabRepo.updateMentorRequestStatus(requestId, "Accepted");
    };
    rejectRequest = async (requestId) => {
        logger.debug(`Rejecting mentor request: ${requestId}`);
        this.checkData(requestId);
        return await this.collabRepo.updateMentorRequestStatus(requestId, "Rejected");
    };
    getRequestForUser = async (userId) => {
        logger.debug(`Fetching requests for user: ${userId}`);
        this.checkData(userId);
        return await this.collabRepo.getRequestByUserId(userId);
    };
    processPaymentService = async (paymentMethodId, amount, requestId, mentorRequestData, email, returnUrl) => {
        logger.debug(`Processing payment for request: ${requestId}`);
        this.checkData({ paymentMethodId, amount, requestId, email, returnUrl });
        if (!mentorRequestData.mentorId || !mentorRequestData.userId) {
            throw new ServiceError("Mentor ID and User ID are required");
        }
        const idempotencyKey = uuid();
        let customers = await stripe.customers.list({ email, limit: 1 });
        let customer = customers.data.length > 0 ? customers.data[0] : null;
        if (!customer) {
            customer = await stripe.customers.create({
                email,
                payment_method: paymentMethodId,
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }
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
        if (paymentIntent.status === "succeeded") {
            const startDate = new Date();
            const endDate = new Date(startDate);
            const totalSessions = mentorRequestData.timePeriod || 1;
            const sessionDay = mentorRequestData.selectedSlot?.day;
            if (!sessionDay) {
                throw new ServiceError("Selected slot day is required");
            }
            let sessionCount = 0;
            while (sessionCount < totalSessions) {
                endDate.setDate(endDate.getDate() + 1);
                if (endDate.toLocaleDateString("en-US", { weekday: "long" }) ===
                    sessionDay) {
                    sessionCount++;
                }
            }
            const collaboration = await this.collabRepo.createCollaboration({
                mentorId: mentorRequestData.mentorId,
                userId: mentorRequestData.userId,
                selectedSlot: mentorRequestData.selectedSlot
                    ? [mentorRequestData.selectedSlot]
                    : [],
                price: amount / 100,
                payment: true,
                isCancelled: false,
                startDate,
                endDate,
            });
            const mentor = await this.mentorRepo.getMentorById(this.collabRepo["toObjectId"](mentorRequestData.mentorId).toString());
            if (!mentor || !mentor.userId) {
                throw new ServiceError("Mentor or mentor’s userId not found");
            }
            const [contact1, contact2] = await Promise.all([
                this.contactRepo.createContact({
                    userId: this.collabRepo["toObjectId"](mentorRequestData.userId).toString(),
                    targetUserId: mentor.userId,
                    collaborationId: collaboration._id,
                    type: "user-mentor",
                }),
                this.contactRepo.createContact({
                    userId: mentor.userId,
                    targetUserId: this.collabRepo["toObjectId"](mentorRequestData.userId).toString(),
                    collaborationId: collaboration._id,
                    type: "user-mentor",
                }),
            ]);
            await this.collabRepo.deleteMentorRequest(requestId);
            return { paymentIntent, contacts: [contact1, contact2] };
        }
        return { paymentIntent };
    };
    getCollabDataForUserService = async (userId) => {
        logger.debug(`Fetching collaboration data for user: ${userId}`);
        this.checkData(userId);
        return await this.collabRepo.getCollabDataForUser(userId);
    };
    getCollabDataForMentorService = async (mentorId) => {
        logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
        this.checkData(mentorId);
        return await this.collabRepo.getCollabDataForMentor(mentorId);
    };
    removeCollab = async (collabId, reason) => {
        logger.debug(`Removing collaboration: ${collabId}`);
        this.checkData({ collabId, reason });
        const collab = await this.collabRepo.findCollabById(collabId);
        if (!collab) {
            throw new ServiceError("Collaboration not found");
        }
        const mentorEmail = collab.mentorId.userId?.email;
        const mentorName = collab.mentorId.userId?.name;
        const userName = collab.userId.name;
        if (!mentorEmail) {
            throw new ServiceError("Mentor email not found");
        }
        const subject = "Mentorship Session Cancellation Notice";
        const text = `Dear ${mentorName},\n\nWe regret to inform you that your mentorship session with ${userName} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
        await sendEmail(mentorEmail, subject, text);
        logger.info(`Cancellation email sent to mentor: ${mentorEmail}`);
        return await this.collabRepo.markCollabAsCancelled(collabId);
    };
    getMentorRequestsService = async ({ page, limit, search, }) => {
        logger.debug(`Fetching mentor requests for admin`);
        return await this.collabRepo.findMentorRequest({ page, limit, search });
    };
    getCollabsService = async ({ page, limit, search, }) => {
        logger.debug(`Fetching collaborations for admin`);
        return await this.collabRepo.findCollab({ page, limit, search });
    };
    fetchCollabById = async (collabId) => {
        logger.debug(`Fetching collaboration by ID: ${collabId}`);
        this.checkData(collabId);
        return await this.collabRepo.findCollabDetails(collabId);
    };
    fetchRequestById = async (requestId) => {
        logger.debug(`Fetching request by ID: ${requestId}`);
        this.checkData(requestId);
        return await this.collabRepo.fetchMentorRequestDetails(requestId);
    };
    markUnavailableDaysService = async (collabId, updateData) => {
        logger.debug(`Marking unavailable days for collaboration: ${collabId}`);
        this.checkData({ collabId, updateData });
        return await this.collabRepo.updateUnavailableDays(collabId, updateData);
    };
    updateTemporarySlotChangesService = async (collabId, updateData) => {
        logger.debug(`Updating temporary slot changes for collaboration: ${collabId}`);
        this.checkData({ collabId, updateData });
        return await this.collabRepo.updateTemporarySlotChanges(collabId, updateData);
    };
    processTimeSlotRequest = async (collabId, requestId, isApproved, requestType) => {
        logger.debug(`Processing time slot request for collaboration: ${collabId}`);
        this.checkData({ collabId, requestId, requestType });
        const status = isApproved ? "approved" : "rejected";
        const collaboration = await this.collabRepo.findCollabById(collabId);
        if (!collaboration) {
            throw new ServiceError("Collaboration not found");
        }
        let requestedBy;
        if (requestType === "unavailable") {
            const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
            if (!request) {
                throw new ServiceError("Unavailable days request not found");
            }
            requestedBy = request.requestedBy;
        }
        else {
            const request = collaboration.temporarySlotChanges.find((req) => req._id.toString() === requestId);
            if (!request) {
                throw new ServiceError("Time slot change request not found");
            }
            requestedBy = request.requestedBy;
        }
        if (!requestedBy) {
            throw new ServiceError("Unable to determine who requested the change");
        }
        let newEndDate;
        if (requestType === "unavailable" && status === "approved") {
            const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
            if (request) {
                const unavailableDates = request.datesAndReasons.map((item) => new Date(item.date));
                const selectedDay = collaboration.selectedSlot[0]?.day;
                if (!selectedDay) {
                    throw new ServiceError("Selected slot day not found");
                }
                const currentEndDate = collaboration.endDate || collaboration.startDate;
                newEndDate = this.calculateNewEndDate(currentEndDate, unavailableDates, selectedDay);
            }
        }
        const updatedCollaboration = await this.collabRepo.updateRequestStatus(collabId, requestId, requestType, status, newEndDate);
        if (status === "rejected") {
            const userEmail = collaboration.userId.email;
            const userName = collaboration.userId.name;
            const mentorEmail = collaboration.mentorId.userId.email;
            const mentorName = collaboration.mentorId.userId.name;
            if (!userEmail || !mentorEmail) {
                throw new ServiceError("User or mentor email not found");
            }
            const recipientEmail = requestedBy === "user" ? mentorEmail : userEmail;
            const recipientName = requestedBy === "user" ? mentorName : userName;
            const otherPartyName = requestedBy === "user" ? userName : mentorName;
            const subject = "Request Rejection Notice";
            const text = `Dear ${recipientName},\n\nWe regret to inform you that the request for ${requestType === "unavailable"
                ? "unavailable days"
                : "a time slot change"} in your mentorship session with ${otherPartyName} has been rejected.\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
            await sendEmail(recipientEmail, subject, text);
            logger.info(`Rejection email sent to ${requestedBy === "user" ? "mentor" : "user"}: ${recipientEmail}`);
        }
        return updatedCollaboration;
    };
    getMentorLockedSlots = async (mentorId) => {
        logger.debug(`Fetching locked slots for mentor: ${mentorId}`);
        this.checkData(mentorId);
        return await this.collabRepo.getLockedSlotsByMentorId(mentorId);
    };
    calculateNewEndDate(currentEndDate, unavailableDates, selectedDay) {
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
    }
}
//# sourceMappingURL=CollaborationService.js.map