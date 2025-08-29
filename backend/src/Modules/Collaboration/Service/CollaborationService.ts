import { BaseService } from "../../../core/Services/BaseService";
import { CollaborationRepository } from "../Repositry/CollaborationRepositry";
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
import { Types } from "mongoose";
import { NotificationService } from "../../Notification/Service/NotificationService";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import PDFDocument from 'pdfkit';

export class CollaborationService extends BaseService {
  private collabRepo: CollaborationRepository;
  private contactRepo: ContactRepository;
  private mentorRepo: MentorRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.collabRepo = new CollaborationRepository();
    this.contactRepo = new ContactRepository();
    this.mentorRepo = new MentorRepository();
    this.userRepo = new UserRepository();
    this.notificationService = new NotificationService();
  }

  TemporaryRequestService = async (
    requestData: Partial<IMentorRequest>
  ): Promise<IMentorRequest> => {
    logger.debug(`Creating temporary request`);
    this.checkData(requestData);
    return await this.collabRepo.createTemporaryRequest({
      ...requestData,
      paymentStatus: "Pending",
      isAccepted: "Pending",
    });
  };

  getMentorRequests = async (mentorId: string): Promise<IMentorRequest[]> => {
    logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
    this.checkData(mentorId);
    if (!Types.ObjectId.isValid(mentorId)) {
      throw new ServiceError(
        "Invalid mentor ID: must be a 24 character hex string"
      );
    }
    const requests = await this.collabRepo.getMentorRequestsByMentorId(
      mentorId
    );
    logger.info(
      `Fetched ${requests.length} mentor requests for mentorId: ${mentorId}`
    );
    return requests;
  };

  acceptRequest = async (requestId: string): Promise<IMentorRequest | null> => {
    logger.debug(`Accepting mentor request: ${requestId}`);
    this.checkData(requestId);

    const updatedRequest = await this.collabRepo.updateMentorRequestStatus(
      requestId,
      "Accepted"
    );
    if (!updatedRequest) {
      throw new ServiceError("Updating status of request failed");
    }

    // Fetch user and mentor details for notifications
    const user = await this.userRepo.findById(updatedRequest.userId.toString());
    const mentor = await this.mentorRepo.getMentorById(
      updatedRequest.mentorId.toString()
    );

    if (!user || !mentor || !mentor.userId) {
      throw new ServiceError("User or mentor details not found");
    }
    const mentorUser = mentor.userId as {
      _id: Types.ObjectId;
      name: string;
      email: string;
    };

    try {
      const userEmail = user.email;
      const userName = user.name;
      const mentorEmail = mentorUser.email;
      const mentorName = mentorUser.name;

      if (!userEmail || !mentorEmail) {
        throw new ServiceError("User or mentor email not found");
      }

      const userSubject = "Mentor Request Acceptance Notice";
      const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been accepted. Please proceed with the payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(userEmail, userSubject, userText);
      logger.info(`Acceptance email sent to user: ${userEmail}`);

      const mentorSubject = "Mentor Request Acceptance Notice";
      const mentorText = `Dear ${mentorName},\n\nYou have accepted the mentor request from ${userName}. Awaiting payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(mentorEmail, mentorSubject, mentorText);
      logger.info(`Acceptance email sent to mentor: ${mentorEmail}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ServiceError || error instanceof Error
          ? error.message
          : "Unknown error occurred";
      logger.error(
        `Error sending emails for request ${requestId}: ${errorMessage}`
      );
      throw new ServiceError(`Failed to send emails: ${errorMessage}`);
    }

    // Send notifications for user and mentor
    try {
      // User notification: Mentor request accepted
      await this.notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentorUser._id.toString(),
        requestId,
        "collaboration",
        undefined, // callId
        undefined, // callType
        `Your mentor request has been accepted by ${mentorUser.name}. Waiting for payment.`
      );
      logger.info(`Sent collaboration_status notification to user ${user._id}`);

      // Mentor notification: You accepted the request
      await this.notificationService.sendNotification(
        mentorUser._id.toString(),
        "collaboration_status",
        user._id.toString(),
        requestId,
        "collaboration",
        undefined, // callId
        undefined, // callType
        `You have accepted the mentor request from ${user.name}.`
      );
      logger.info(
        `Sent collaboration_status notification to mentor ${mentorUser._id}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ServiceError || error instanceof Error
          ? error.message
          : "Unknown error occurred";
      logger.error(
        `Error sending notifications for request ${requestId}: ${errorMessage}`
      );
      throw new ServiceError(`Failed to send notifications: ${errorMessage}`);
    }

    return updatedRequest;
  };

  rejectRequest = async (requestId: string): Promise<IMentorRequest | null> => {
    logger.debug(`Rejecting mentor request: ${requestId}`);
    this.checkData(requestId);

    const updatedRequest = await this.collabRepo.updateMentorRequestStatus(
      requestId,
      "Rejected"
    );
    if (!updatedRequest) {
      throw new ServiceError("Updating status of request failed");
    }

    // Fetch user and mentor details for email and notifications
    const user = await this.userRepo.findById(updatedRequest.userId.toString());
    const mentor = await this.mentorRepo.getMentorById(
      updatedRequest.mentorId.toString()
    );
    if (!user || !mentor || !mentor.userId) {
      throw new ServiceError("User or mentor details not found");
    }

    const mentorUser = mentor.userId as {
      _id: Types.ObjectId;
      name: string;
      email: string;
    };

    // Send rejection emails
    const userEmail = user.email;
    const userName = user.name;
    const mentorEmail = mentorUser.email;
    const mentorName = mentorUser.name;

    if (!userEmail || !mentorEmail) {
      throw new ServiceError("User or mentor email not found");
    }

    const userSubject = "Mentor Request Rejection Notice";
    const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been rejected.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(userEmail, userSubject, userText);
    logger.info(`Rejection email sent to user: ${userEmail}`);

    const mentorSubject = "Mentor Request Rejection Notice";
    const mentorText = `Dear ${mentorName},\n\nYou have rejected the mentor request from ${userName}.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(mentorEmail, mentorSubject, mentorText);
    logger.info(`Rejection email sent to mentor: ${mentorEmail}`);

    // Send rejection notifications
    try {
      // User notification: Mentor request rejected
      await this.notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentorUser._id.toString(),
        requestId,
        "collaboration",
        undefined, // callId
        undefined, // callType
        `Your mentor request to ${mentorUser.name} has been rejected. Check your email for more details.`
      );
      logger.info(`Sent collaboration_status notification to user ${user._id}`);

      // Mentor notification: You rejected the request
      await this.notificationService.sendNotification(
        mentorUser._id.toString(),
        "collaboration_status",
        user._id.toString(),
        requestId,
        "collaboration",
        undefined, // callId
        undefined, // callType
        `You have rejected the mentor request from ${user.name}. Check your email for more details.`
      );
      logger.info(
        `Sent collaboration_status notification to mentor ${mentorUser._id}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ServiceError || error instanceof Error
          ? error.message
          : "Unknown error occurred";
      logger.error(
        `Error sending notifications for request ${requestId}: ${errorMessage}`
      );
      throw new ServiceError(`Failed to send notifications: ${errorMessage}`);
    }

    return updatedRequest;
  };

  getRequestForUser = async (userId: string): Promise<IMentorRequest[]> => {
    logger.debug(`Fetching requests for user: ${userId}`);
    this.checkData(userId);
    if (!Types.ObjectId.isValid(userId)) {
      throw new ServiceError(
        "Invalid user ID: must be a 24 character hex string"
      );
    }
    const requests = await this.collabRepo.getRequestByUserId(userId);
    logger.info(
      `Fetched ${requests.length} mentor requests for userId: ${userId}`
    );
    return requests;
  };

  processPaymentService = async (
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
      logger.info("Collaboartion Details : ", collaboration);

      const mentor = await this.mentorRepo.getMentorById(
        this.collabRepo["toObjectId"](mentorRequestData.mentorId).toString()
      );
      logger.info("Mentor : ", mentor);
      if (!mentor || !mentor.userId) {
        throw new ServiceError("Mentor or mentor’s userId not found");
      }
      const mentorUser = mentor.userId as {
        _id: Types.ObjectId;
        name: string;
        email: string;
      };

      const user = await this.userRepo.findById(
        this.collabRepo["toObjectId"](mentorRequestData.userId).toString()
      );
      if (!user) {
        throw new ServiceError("User not found");
      }

      const [contact1, contact2] = await Promise.all([
        this.contactRepo.createContact({
          userId: this.collabRepo["toObjectId"](
            mentorRequestData.userId
          ).toString(),
          targetUserId: mentorUser._id.toString(),
          collaborationId: collaboration._id,
          type: "user-mentor",
        }),
        this.contactRepo.createContact({
          userId: mentorUser._id.toString(),
          targetUserId: this.collabRepo["toObjectId"](
            mentorRequestData.userId
          ).toString(),
          collaborationId: collaboration._id,
          type: "user-mentor",
        }),
      ]);

      // Send collaboration created notifications
      try {
        // User notification: Payment completed and collaboration created
        await this.notificationService.sendNotification(
          user._id.toString(),
          "collaboration_status",
          mentorUser._id.toString(),
          collaboration._id.toString(),
          "collaboration",
          undefined, // callId
          undefined, // callType
          `Payment completed and collaboration created with ${mentorUser.name}!`
        );
        logger.info(
          `Sent collaboration_status notification to user ${user._id}`
        );

        // Mentor notification: User’s payment completed and collaboration created
        await this.notificationService.sendNotification(
          mentorUser._id.toString(),
          "collaboration_status",
          user._id.toString(),
          collaboration._id.toString(),
          "collaboration",
          undefined, // callId
          undefined, // callType
          `${user.name}’s payment completed and collaboration created!`
        );
        logger.info(
          `Sent collaboration_status notification to mentor ${mentorUser._id}`
        );
      } catch (error: unknown) {
        // Type guard to check if error is ServiceError or Error
        const errorMessage =
          error instanceof ServiceError || error instanceof Error
            ? error.message
            : "Unknown error occurred";
        logger.error(
          `Error sending notifications for collaboration ${collaboration._id}: ${errorMessage}`
        );
        throw new ServiceError(`Failed to send notifications: ${errorMessage}`);
      }

      await this.collabRepo.deleteMentorRequest(requestId);
      return { paymentIntent, contacts: [contact1, contact2] };
    }
    return { paymentIntent };
  };

  //Check whether the collbaoration is completed
  private async checkAndCompleteCollaboration(
    collab: ICollaboration
  ): Promise<ICollaboration | null> {
    const currentDate = new Date();
    if (
      !collab.isCancelled &&
      (collab.feedbackGiven ||
        (collab.endDate && collab.endDate <= currentDate))
    ) {
      logger.debug(`Marking collaboration ${collab._id} as complete`);

      // Update the collaboration to set isCompleted to true
      const updatedCollab = await this.collabRepo.findByIdAndUpdate(
        collab._id.toString(),
        { isCompleted: true },
        { new: true }
      );

      // Delete associated contacts
      await this.contactRepo.deleteContact(
        collab._id.toString(),
        "user-mentor"
      );
      logger.info(
        `Collaboration ${collab._id} was completed, so associated contact was deleted`
      );

      return updatedCollab;
    }
    return collab;
  }

  getCollabDataForUserService = async (
    userId: string
  ): Promise<ICollaboration[]> => {
    logger.debug(`Fetching collaboration data for user: ${userId}`);
    this.checkData(userId);
    if (!Types.ObjectId.isValid(userId)) {
      throw new ServiceError(
        "Invalid user ID: must be a 24 character hex string"
      );
    }
    const collaborations = await this.collabRepo.getCollabDataForUser(userId);
    const updatedCollaborations = await Promise.all(
      collaborations.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );
    const activeCollaborations = updatedCollaborations.filter(
      (collab): collab is ICollaboration =>
        collab !== null && !collab.isCompleted
    );
    logger.info(
      `Fetched ${activeCollaborations.length} active collaborations for userId: ${userId}`
    );
    return activeCollaborations;
  };

  getCollabDataForMentorService = async (
    mentorId: string
  ): Promise<ICollaboration[]> => {
    logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
    this.checkData(mentorId);
    if (!Types.ObjectId.isValid(mentorId)) {
      throw new ServiceError(
        "Invalid mentor ID: must be a 24 character hex string"
      );
    }
    const collaborations = await this.collabRepo.getCollabDataForMentor(
      mentorId
    );
    const updatedCollaborations = await Promise.all(
      collaborations.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );
    const activeCollaborations = updatedCollaborations.filter(
      (collab): collab is ICollaboration =>
        collab !== null && !collab.isCompleted
    );
    logger.info(
      `Fetched ${activeCollaborations.length} active collaborations for mentorId: ${mentorId}`
    );
    return activeCollaborations;
  };

  cancelAndRefundCollab = async (
    collabId: string,
    reason: string,
    amount: number
  ): Promise<ICollaboration | null> => {
    logger.debug(
      `Processing cancellation and refund for collaboration: ${collabId}`
    );
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
      logger.info(
        `Refund processed for collaboration ${collabId}: ${
          refund.id
        }, amount: ${refundAmount / 100} INR`
      );
    } else {
      logger.warn(
        `No paymentIntentId for collaboration ${collabId}. Skipping refund and notifying support.`
      );
    }

    // Mark collaboration as cancelled
    const updatedCollab = await this.collabRepo.markCollabAsCancelled(collabId);
    await this.contactRepo.deleteContact(collabId, "user-mentor");

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
      ? `Dear ${userName},\n\nYour mentorship session with ${mentorName} has been cancelled, and a 50% refund of Rs. ${amount.toFixed(
          2
        )} has been processed.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`
      : `Dear ${userName},\n\nYour mentorship session with ${mentorName} has been cancelled. No refund was processed due to missing payment details. Please contact support for assistance.\nReason: ${reason}\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(userEmail, userSubject, userText);
    logger.info(`Cancellation and refund email sent to user: ${userEmail}`);

    // Mentor email
    const mentorSubject = "Mentorship Session Cancellation Notice";
    const mentorText = `Dear ${mentorName},\n\nWe regret to inform you that your mentorship session with ${userName} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
    await sendEmail(mentorEmail, mentorSubject, mentorText);
    logger.info(`Cancellation email sent to mentor: ${mentorEmail}`);

    logger.info(
      `Collaboration ${collabId} cancelled${
        collab.paymentIntentId
          ? ` with 50% refund of Rs. ${amount.toFixed(2)}`
          : ""
      }`
    );
    return updatedCollab;
  };

  getMentorRequestsService = async ({
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
    logger.debug(
      `Fetching mentor requests for admin with page: ${page}, limit: ${limit}, search: ${search}`
    );
    const result = await this.collabRepo.findMentorRequest({
      page,
      limit,
      search,
    });
    logger.info(
      `Fetched ${result.requests.length} mentor requests, total: ${result.total}`
    );
    return result;
  };

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
    logger.debug(
      `Fetching collaborations for admin with page: ${page}, limit: ${limit}, search: ${search}`
    );
    const {
      collabs,
      total,
      page: currentPage,
      pages,
    } = await this.collabRepo.findCollab({
      page,
      limit,
      search,
    });
    const updatedCollabs = await Promise.all(
      collabs.map(async (collab) => {
        return await this.checkAndCompleteCollaboration(collab);
      })
    );
    const filteredCollabs = updatedCollabs.filter(
      (collab): collab is ICollaboration => collab !== null
    );
    logger.info(
      `Fetched ${filteredCollabs.length} collaborations, total: ${total}`
    );
    return { collabs: filteredCollabs, total, page: currentPage, pages };
  }

  fetchCollabById = async (
    collabId: string
  ): Promise<ICollaboration | null> => {
    logger.debug(`Fetching collaboration by ID: ${collabId}`);
    this.checkData(collabId);
    if (!Types.ObjectId.isValid(collabId)) {
      throw new ServiceError(
        "Invalid collaboration ID: must be a 24 character hex string"
      );
    }
    const collab = await this.collabRepo.findCollabById(collabId);
    if (collab && (collab.isCancelled || collab.isCompleted)) {
      logger.info(`Collaboration ${collabId} is cancelled or completed`);
      return null;
    }
    logger.info(
      `Collaboration ${
        collab ? "found" : "not found"
      } for collabId: ${collabId}`
    );
    return collab;
  };

  fetchRequestById = async (
    requestId: string
  ): Promise<IMentorRequest | null> => {
    logger.debug(`Fetching request by ID: ${requestId}`);
    this.checkData(requestId);
    if (!Types.ObjectId.isValid(requestId)) {
      throw new ServiceError(
        "Invalid request ID: must be a 24 character hex string"
      );
    }
    const request = await this.collabRepo.fetchMentorRequestDetails(requestId);
    logger.info(
      `Mentor request ${
        request ? "found" : "not found"
      } for requestId: ${requestId}`
    );
    return request;
  };

  markUnavailableDaysService = async (
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
  };

  updateTemporarySlotChangesService = async (
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
  };

  processTimeSlotRequest = async (
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
  };

  getMentorLockedSlots = async (mentorId: string): Promise<LockedSlot[]> => {
    logger.debug(`Fetching locked slots for mentor: ${mentorId}`);
    this.checkData(mentorId);
    if (!Types.ObjectId.isValid(mentorId)) {
      throw new ServiceError(
        "Invalid mentor ID: must be a 24 character hex string"
      );
    }
    const lockedSlots = await this.collabRepo.getLockedSlotsByMentorId(
      mentorId
    );
    logger.info(
      `Fetched ${lockedSlots.length} locked slots for mentorId: ${mentorId}`
    );
    return lockedSlots;
  };

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

  async getReceiptData(collabId: string) {
    logger.debug(`Fetching receipt data for collaboration: ${collabId}`);
    this.checkData(collabId);
    if (!Types.ObjectId.isValid(collabId)) {
      throw new ServiceError("Invalid collaboration ID: must be a 24 character hex string");
    }

    const collab = await this.collabRepo.findCollabById(collabId);
    if (!collab || !collab.paymentIntentId) {
      throw new ServiceError("Collaboration or payment not found");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(collab.paymentIntentId);
    if (!paymentIntent) {
      throw new ServiceError("Payment intent not found");
    }

    const mentor = await this.mentorRepo.getMentorById(
      this.collabRepo["toObjectId"](collab.mentorId).toString()
    );
    if (!mentor || !mentor.userId) {
      throw new ServiceError("Mentor or mentor’s userId not found");
    }
    const mentorUser = mentor.userId as { name: string; email: string };

    const user = await this.userRepo.findById(
      this.collabRepo["toObjectId"](collab.userId).toString()
    );
    if (!user) {
      throw new ServiceError("User not found");
    }

    return { mentorUser, user, paymentIntent, collab };
  }


  async generateReceiptPDF(collabId: string): Promise<Buffer> {
    logger.debug(`Generating PDF receipt for collaboration: ${collabId}`);
    this.checkData(collabId);

    const { mentorUser, user, paymentIntent, collab } = await this.getReceiptData(collabId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      // Collect PDF data into buffers
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (error: Error) => {
        logger.error(`Error generating PDF for collabId ${collabId}: ${error}`);
        reject(new ServiceError('Failed to generate PDF'));
      });

      // Add content to PDF
      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.fontSize(14).text('ConnectSphere Mentorship Platform', { align: 'center' });
      doc.fontSize(10).text(`Issued on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).text('Receipt Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Collaboration ID: ${collab.collaborationId || collab._id}`);
      doc.text(`Mentor: ${mentorUser.name}`);
      doc.text(`User: ${user.name}`);
      doc.text(`Amount: INR ${(collab.price || 0).toFixed(2)}`);
      doc.text(`Payment Date: ${paymentIntent.created ? new Date(paymentIntent.created * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}`);
      doc.text(`Payment ID: ${paymentIntent.id}`);
      doc.text(`Status: ${paymentIntent.status.charAt(0).toUpperCase() + paymentIntent.status.slice(1)}`);
      doc.moveDown(2);

      doc.fontSize(12).text('Description', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(
        `Payment for mentorship session with ${mentorUser.name} from ` +
        `${collab.startDate ? collab.startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified"} to ` +
        `${collab.endDate ? collab.endDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified"}`
      );
      doc.moveDown(2);

      doc.fontSize(12).text('Contact Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text('For any inquiries, please contact ConnectSphere support at support@connectsphere.com.');

      // Finalize PDF
      doc.end();
    })
  }
}
