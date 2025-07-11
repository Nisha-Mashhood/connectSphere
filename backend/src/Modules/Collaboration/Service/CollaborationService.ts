import { BaseService } from "../../../core/Services/BaseService";
import {CollaborationRepository} from "../Repositry/CollaborationRepositry";
import { MentorRepository } from "../../Mentor/Repositry/MentorRepositry";
import { ContactRepository } from "../../Contact/Repositry/ContactRepositry";
import { sendEmail } from "../../../core/Utils/Email";
import stripe from "../../../core/Utils/Stripe";
import { v4 as uuid } from "uuid";
import logger from "../../../core/Utils/Logger";
import { ICollaboration } from "../../../Interfaces/models/ICollaboration";
import { IMentorRequest } from "../../../Interfaces/models/IMentorRequest";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import { LockedSlot } from "../Types/types";

export class CollaborationService extends BaseService {
  private collabRepo: CollaborationRepository;
  private contactRepo: ContactRepository;
  private mentorRepo: MentorRepository;

  constructor() {
    super();
    this.collabRepo = new CollaborationRepository();
    this.contactRepo = new ContactRepository();
    this.mentorRepo = new MentorRepository();
  }

   TemporaryRequestService = async(
    requestData: Partial<IMentorRequest>
  ): Promise<IMentorRequest> => {
    logger.debug(`Creating temporary request`);
    this.checkData(requestData);
    return await this.collabRepo.createTemporaryRequest({
      ...requestData,
      paymentStatus: "Pending",
      isAccepted: "Pending",
    });
  }

   getMentorRequests = async(mentorId: string): Promise<IMentorRequest[]> => {
    logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
    this.checkData(mentorId);
    return await this.collabRepo.getMentorRequestsByMentorId(mentorId);
  }

   acceptRequest = async(requestId: string): Promise<IMentorRequest | null> => {
    logger.debug(`Accepting mentor request: ${requestId}`);
    this.checkData(requestId);
    return await this.collabRepo.updateMentorRequestStatus(
      requestId,
      "Accepted"
    );
  }

   rejectRequest = async(requestId: string): Promise<IMentorRequest | null> => {
    logger.debug(`Rejecting mentor request: ${requestId}`);
    this.checkData(requestId);
    return await this.collabRepo.updateMentorRequestStatus(
      requestId,
      "Rejected"
    );
  }

   getRequestForUser = async(userId: string): Promise<IMentorRequest[]> =>{
    logger.debug(`Fetching requests for user: ${userId}`);
    this.checkData(userId);
    return await this.collabRepo.getRequestByUserId(userId);
  }

   processPaymentService = async(
    paymentMethodId: string,
    amount: number,
    requestId: string,
    mentorRequestData: Partial<IMentorRequest>,
    email: string,
    returnUrl: string
  ): Promise<{ paymentIntent: any; contacts?: any[] }> => {
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
      },
      { idempotencyKey }
    );

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
        if (
          endDate.toLocaleDateString("en-US", { weekday: "long" }) ===
          sessionDay
        ) {
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
        paymentIntentId: paymentIntent.id,
      });

      const mentor = await this.mentorRepo.getMentorById(
        this.collabRepo["toObjectId"](mentorRequestData.mentorId).toString()
      );
      if (!mentor || !mentor.userId) {
        throw new ServiceError("Mentor or mentor’s userId not found");
      }

      const [contact1, contact2] = await Promise.all([
        this.contactRepo.createContact({
          userId: this.collabRepo["toObjectId"](
            mentorRequestData.userId
          ).toString(),
          targetUserId: mentor.userId,
          collaborationId: collaboration._id,
          type: "user-mentor",
        }),
        this.contactRepo.createContact({
          userId: mentor.userId,
          targetUserId: this.collabRepo["toObjectId"](
            mentorRequestData.userId
          ).toString(),
          collaborationId: collaboration._id,
          type: "user-mentor",
        }),
      ]);

      await this.collabRepo.deleteMentorRequest(requestId);
      return { paymentIntent, contacts: [contact1, contact2] };
    }

    return { paymentIntent };
  }

  //Check whether the collbaoration is completed
  private async checkAndCompleteCollaboration(collab: ICollaboration): Promise<ICollaboration | null> {
    const currentDate = new Date();
  if (
    !collab.isCancelled &&
    (collab.feedbackGiven || (collab.endDate && collab.endDate <= currentDate))
  ) {
    logger.debug(`Marking collaboration ${collab._id} as complete`);

    // Update the collaboration to set isCompleted to true
    const updatedCollab = await this.collabRepo.findByIdAndUpdate(
      collab._id.toString(),
      { isCompleted: true }, 
      { new: true }
    );

    // Delete associated contacts
    await this.contactRepo.deleteContact(collab._id.toString(), 'user-mentor');
    logger.info(`Collaboration ${collab._id} was completed, so associated contact was deleted`);

    return updatedCollab;
  }
  return collab;
  }

   getCollabDataForUserService = async(userId: string): Promise<ICollaboration[]> => {
    logger.debug(`Fetching collaboration data for user: ${userId}`);
    this.checkData(userId);
    const collaborations = await this.collabRepo.getCollabDataForUser(userId);
    const updatedCollaborations = await Promise.all(
      collaborations.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );

    return updatedCollaborations.filter(
    (collab): collab is ICollaboration => collab !== null && !collab.isCompleted
  );
  }

   getCollabDataForMentorService = async(
    mentorId: string
  ): Promise<ICollaboration[]> => {
    logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
    this.checkData(mentorId);
    const collaborations = await this.collabRepo.getCollabDataForMentor(mentorId);
    const updatedCollaborations = await Promise.all(
      collaborations.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );

    return updatedCollaborations.filter(
    (collab): collab is ICollaboration => collab !== null && !collab.isCompleted
  );
  }

  //  removeCollab = async(
  //   collabId: string,
  //   reason: string
  // ): Promise<ICollaboration | null> => {
  //   logger.debug(`Removing collaboration: ${collabId}`);
  //   this.checkData({ collabId, reason });
  //   const collab = await this.collabRepo.findCollabById(collabId);
  //   if (!collab) {
  //     throw new ServiceError("Collaboration not found");
  //   }

  //   const mentorEmail = (collab.mentorId as any).userId?.email;
  //   const mentorName = (collab.mentorId as any).userId?.name;
  //   const userName = (collab.userId as any).name;

  //   if (!mentorEmail) {
  //     throw new ServiceError("Mentor email not found");
  //   }

  //   const subject = "Mentorship Session Cancellation Notice";
  //   const text = `Dear ${mentorName},\n\nWe regret to inform you that your mentorship session with ${userName} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
  //   await sendEmail(mentorEmail, subject, text);
  //   logger.info(`Cancellation email sent to mentor: ${mentorEmail}`);

  //   const updatedCollab = await this.collabRepo.markCollabAsCancelled(collabId);
  //   await this.contactRepo.deleteContact(collabId, 'user-mentor');

  //   logger.info(`Collaboration ${collabId} cancelled and associated contacts deleted`);
  //   return updatedCollab;
  // }

  cancelAndRefundCollab = async (
    collabId: string,
    reason: string,
    amount: number
  ): Promise<ICollaboration | null> => {
    logger.debug(`Processing cancellation and refund for collaboration: ${collabId}`);
    this.checkData({ collabId, reason, amount });

    const collab = await this.collabRepo.findCollabById(collabId);
    if (!collab) {
      throw new ServiceError("Collaboration not found");
    }
    if (!collab.payment) {
      throw new ServiceError("No payment found for this collaboration");
    }
    if (collab.isCancelled) {
      throw new ServiceError("Collaboration is already cancelled");
    }

    // Attempt refund if paymentIntentId exists
    if (collab.paymentIntentId) {
      const refundAmount = Math.round(amount * 100); 
      const refund = await stripe.refunds.create({
        payment_intent: collab.paymentIntentId,
        amount: refundAmount,
        reason: "requested_by_customer",
        metadata: { collabId, reason },
      });
      logger.info(`Refund processed for collaboration ${collabId}: ${refund.id}, amount: ${refundAmount / 100} INR`);
    } else {
      logger.warn(`No paymentIntentId for collaboration ${collabId}. Skipping refund and notifying support.`);
    }

    // Mark collaboration as cancelled
    const updatedCollab = await this.collabRepo.markCollabAsCancelled(collabId);
    await this.contactRepo.deleteContact(collabId, 'user-mentor');

    // Send emails to user and mentor
    const userEmail = (collab.userId as any).email;
    const userName = (collab.userId as any).name;
    const mentorEmail = (collab.mentorId as any).userId?.email;
    const mentorName = (collab.mentorId as any).userId?.name;

    if (!userEmail || !mentorEmail) {
      throw new ServiceError("User or mentor email not found");
    }

    // User email
    const userSubject = "Mentorship Cancellation and Refund Notice";
    const userText = collab.paymentIntentId
      ? `Dear ${userName},\n\nYour mentorship session with ${mentorName} has been cancelled, and a 50% refund of Rs. ${amount.toFixed(2)} has been processed.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`
      : `Dear ${userName},\n\nYour mentorship session with ${mentorName} has been cancelled. No refund was processed due to missing payment details. Please contact support for assistance.\nReason: ${reason}\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(userEmail, userSubject, userText);
    logger.info(`Cancellation and refund email sent to user: ${userEmail}`);

    // Mentor email
    const mentorSubject = "Mentorship Session Cancellation Notice";
    const mentorText = `Dear ${mentorName},\n\nWe regret to inform you that your mentorship session with ${userName} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(mentorEmail, mentorSubject, mentorText);
    logger.info(`Cancellation email sent to mentor: ${mentorEmail}`);

    logger.info(`Collaboration ${collabId} cancelled${collab.paymentIntentId ? ` with 50% refund of Rs. ${amount.toFixed(2)}` : ''}`);
    return updatedCollab;
  };

   getMentorRequestsService = async({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{
    requests: IMentorRequest[];
    total: number;
    page: number;
    pages: number;
  }> => {
    logger.debug(`Fetching mentor requests for admin`);
    return await this.collabRepo.findMentorRequest({ page, limit, search });
  }

   async getCollabsService({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{
    collabs: ICollaboration[];
    total: number;
    page: number;
    pages: number;
  }> {
    logger.debug(`Fetching collaborations for admin`);

    const { collabs, total, page: currentPage, pages } = await this.collabRepo.findCollab({
      page,
      limit,
      search,
    });

    const updatedCollabs = await Promise.all(
      collabs.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );

    return {
      collabs: updatedCollabs.filter((collab): collab is ICollaboration => collab !== null),
      total,
      page: currentPage,
      pages,
    };
  }

   fetchCollabById = async(collabId: string): Promise<ICollaboration | null> => {
    logger.debug(`Fetching collaboration by ID: ${collabId}`);
    this.checkData(collabId);
    return await this.collabRepo.findCollabDetails(collabId);
  }

   fetchRequestById = async(requestId: string): Promise<IMentorRequest | null> => {
    logger.debug(`Fetching request by ID: ${requestId}`);
    this.checkData(requestId);
    return await this.collabRepo.fetchMentorRequestDetails(requestId);
  }

   markUnavailableDaysService = async(
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null> => {
    logger.debug(`Marking unavailable days for collaboration: ${collabId}`);
    this.checkData({ collabId, updateData });
    return await this.collabRepo.updateUnavailableDays(collabId, updateData);
  }

   updateTemporarySlotChangesService = async(
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null> => {
    logger.debug(
      `Updating temporary slot changes for collaboration: ${collabId}`
    );
    this.checkData({ collabId, updateData });
    return await this.collabRepo.updateTemporarySlotChanges(
      collabId,
      updateData
    );
  }

   processTimeSlotRequest = async(
    collabId: string,
    requestId: string,
    isApproved: boolean,
    requestType: "unavailable" | "timeSlot"
  ): Promise<ICollaboration | null> => {
    logger.debug(`Processing time slot request for collaboration: ${collabId}`);
    this.checkData({ collabId, requestId, requestType });
    const status = isApproved ? "approved" : "rejected";
    const collaboration = await this.collabRepo.findCollabById(collabId);
    if (!collaboration) {
      throw new ServiceError("Collaboration not found");
    }

    let requestedBy: "user" | "mentor" | undefined;
    if (requestType === "unavailable") {
      const request = collaboration.unavailableDays.find(
        (req) => req._id.toString() === requestId
      );
      if (!request) {
        throw new ServiceError("Unavailable days request not found");
      }
      requestedBy = request.requestedBy;
    } else {
      const request = collaboration.temporarySlotChanges.find(
        (req) => req._id.toString() === requestId
      );
      if (!request) {
        throw new ServiceError("Time slot change request not found");
      }
      requestedBy = request.requestedBy;
    }

    if (!requestedBy) {
      throw new ServiceError("Unable to determine who requested the change");
    }

    let newEndDate: Date | undefined;
    if (requestType === "unavailable" && status === "approved") {
      const request = collaboration.unavailableDays.find(
        (req) => req._id.toString() === requestId
      );
      if (request) {
        const unavailableDates = request.datesAndReasons.map(
          (item) => new Date(item.date)
        );
        const selectedDay = collaboration.selectedSlot[0]?.day;
        if (!selectedDay) {
          throw new ServiceError("Selected slot day not found");
        }
        const currentEndDate = collaboration.endDate || collaboration.startDate;
        newEndDate = this.calculateNewEndDate(
          currentEndDate,
          unavailableDates,
          selectedDay
        );
      }
    }

    const updatedCollaboration = await this.collabRepo.updateRequestStatus(
      collabId,
      requestId,
      requestType,
      status,
      newEndDate
    );

    if (status === "rejected") {
      const userEmail = (collaboration.userId as any).email;
      const userName = (collaboration.userId as any).name;
      const mentorEmail = (collaboration.mentorId as any).userId.email;
      const mentorName = (collaboration.mentorId as any).userId.name;

      if (!userEmail || !mentorEmail) {
        throw new ServiceError("User or mentor email not found");
      }

      const recipientEmail = requestedBy === "user" ? mentorEmail : userEmail;
      const recipientName = requestedBy === "user" ? mentorName : userName;
      const otherPartyName = requestedBy === "user" ? userName : mentorName;

      const subject = "Request Rejection Notice";
      const text = `Dear ${recipientName},\n\nWe regret to inform you that the request for ${
        requestType === "unavailable"
          ? "unavailable days"
          : "a time slot change"
      } in your mentorship session with ${otherPartyName} has been rejected.\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(recipientEmail, subject, text);
      logger.info(
        `Rejection email sent to ${
          requestedBy === "user" ? "mentor" : "user"
        }: ${recipientEmail}`
      );
    }

    return updatedCollaboration;
  }

   getMentorLockedSlots = async(mentorId: string): Promise<LockedSlot[]> => {
    logger.debug(`Fetching locked slots for mentor: ${mentorId}`);
    this.checkData(mentorId);
    return await this.collabRepo.getLockedSlotsByMentorId(mentorId);
  }

  private calculateNewEndDate(
    currentEndDate: Date,
    unavailableDates: Date[],
    selectedDay: string
  ): Date {
    const dayMap: { [key: string]: number } = {
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
