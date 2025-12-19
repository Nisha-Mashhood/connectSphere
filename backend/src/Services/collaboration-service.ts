import { inject, injectable } from "inversify";
import mongoose, { Types } from "mongoose";
import { v4 as uuid } from "uuid";
import PDFDocument from "pdfkit";
import { StatusCodes } from "../enums/status-code-enums";
import { ICollaboration } from "../Interfaces/Models/i-collaboration";
import { IMentorRequest } from "../Interfaces/Models/i-mentor-request";
import { IUser } from "../Interfaces/Models/i-user";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
import { LockedSlot } from "../Utils/types/collaboration-types";
import { ServiceError } from "../core/utils/error-handler";
import { sendEmail } from "../core/utils/email";
import stripe from "../core/utils/stripe";
import logger from "../core/utils/logger";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { IMentorRequestDTO } from "../Interfaces/DTOs/i-mentor-request-dto";
import { toMentorRequestDTO, toMentorRequestDTOs } from "../Utils/mappers/mentor-request-mapper";
import { toCollaborationDTO } from "../Utils/mappers/collaboration-mapper";
import { ICollaborationDTO } from "../Interfaces/DTOs/i-collaboration-dto";
import Stripe from "stripe";

@injectable()
export class CollaborationService implements ICollaborationService {
  private _collabRepository: ICollaborationRepository;
  private _contactRepository: IContactRepository;
  private _mentorRepository: IMentorRepository;
  private _userRepository: IUserRepository;
  private _notificationService: INotificationService;

  constructor(
    @inject('ICollaborationRepository') collaboartionRepository : ICollaborationRepository,
    @inject('IContactRepository') contactRepository : IContactRepository,
    @inject('IMentorRepository') mentorRepository : IMentorRepository,
    @inject('IUserRepository') userRepository : IUserRepository,
    @inject('INotificationService') notificationService : INotificationService
  ) {
    this._collabRepository = collaboartionRepository;
    this._contactRepository = contactRepository;
    this._mentorRepository = mentorRepository;
    this._userRepository = userRepository;
    this._notificationService = notificationService;
  }

  public TemporaryRequestService = async (
    requestData: Partial<IMentorRequest>
  ): Promise<IMentorRequestDTO | null> => {
    try {
      logger.debug(`Creating temporary request`);
      const request = await this._collabRepository.createTemporaryRequest({
        ...requestData,
        paymentStatus: "Pending",
        isAccepted: "Pending",
      });
      logger.info(`Temporary request created: ${request._id}`);
      return toMentorRequestDTO(request);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating temporary request: ${err.message}`);
      throw new ServiceError(
        "Failed to create temporary request",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public getMentorRequests = async (
    mentorId: string
  ): Promise<IMentorRequestDTO[]> => {
    try {
      logger.debug(`Fetching mentor requests for mentor: ${mentorId}`);
      if (!Types.ObjectId.isValid(mentorId)) {
        throw new ServiceError(
          "Invalid mentor ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const requests = await this._collabRepository.getMentorRequestsByMentorId(
        mentorId
      );
      logger.info(
        `Fetched ${requests.length} mentor requests for mentorId: ${mentorId}`
      );
      return toMentorRequestDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching mentor requests for mentor ${mentorId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor requests",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  private async hasMentorSlotConflict(
    mentorId: string,
    day: string,
    time: string
  ): Promise<boolean> {
    const lockedSlots: LockedSlot[] =
      await this._collabRepository.getLockedSlotsByMentorId(mentorId);

    const normalizedDay = day.trim().toLowerCase();
    const normalizedTime = time.trim().toLowerCase();

    return lockedSlots.some((slot) => {
      const slotDay = slot.day.trim().toLowerCase();
      if (slotDay !== normalizedDay) return false;

      return slot.timeSlots.some(
        (t) => t.trim().toLowerCase() === normalizedTime
      );
    });
  }

  private async hasUserCollabSlotConflict(
    userId: string,
    day: string,
    time: string
  ): Promise<boolean> {
    const collaborations = await this._collabRepository.getCollabDataForUser(userId);

    const normalizedDay = day.trim().toLowerCase();
    const normalizedTime = time.trim().toLowerCase();

    return collaborations.some((collab) => {
      // Skip cancelled or completed collabs
      if (collab.isCancelled || collab.isCompleted) return false;
      if (!Array.isArray(collab.selectedSlot)) return false;

      return collab.selectedSlot.some((slot) => {
        if (!slot.day || !Array.isArray(slot.timeSlots)) return false;

        const slotDay = slot.day.trim().toLowerCase();
        if (slotDay !== normalizedDay) return false;

        return slot.timeSlots.some(
          (t) => t.trim().toLowerCase() === normalizedTime
        );
      });
    });
  }

  public acceptRequest = async (
    requestId: string
  ): Promise<IMentorRequestDTO | null> => {
    try {
      logger.debug(`Accepting mentor request: ${requestId}`);
      if (!Types.ObjectId.isValid(requestId)) {
        throw new ServiceError(
          "Invalid request ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      //Load the request first
    const existingRequest = await this._collabRepository.findMentorRequestById(requestId);

    if (!existingRequest) {
      throw new ServiceError("Mentor request not found", StatusCodes.NOT_FOUND);
    }

    if ( !existingRequest.selectedSlot || !existingRequest.selectedSlot.day ||!existingRequest.selectedSlot.timeSlots ) {
      throw new ServiceError( "Selected time slot not found for this request", StatusCodes.BAD_REQUEST );
    }

    const slotDay = existingRequest.selectedSlot.day;
    const rawTime = existingRequest.selectedSlot.timeSlots;
    const slotTime = Array.isArray(rawTime) ? rawTime[0] : rawTime;
    const mentorIdStr = existingRequest.mentorId.toString();
    const userIdStr = existingRequest.userId.toString();

    //Check mentor schedule (collabs + accepted requests)
    const mentorHasConflict = await this.hasMentorSlotConflict(
      mentorIdStr,
      slotDay,
      slotTime
    );

    if (mentorHasConflict) {
      throw new ServiceError("Mentor already has a session at this time slot", StatusCodes.BAD_REQUEST);
    }

    //Check user schedule (confirmed collaborations)
    const userHasConflict = await this.hasUserCollabSlotConflict(
      userIdStr,
      slotDay,
      slotTime
    );

    if (userHasConflict) {
      throw new ServiceError("User already has a confirmed session at this time slot", StatusCodes.BAD_REQUEST);
    }


      const updatedRequest = await this._collabRepository.updateMentorRequestStatus(
        requestId,
        "Accepted"
      );
      if (!updatedRequest) {
        throw new ServiceError(
          "Updating status of request failed",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      
      const user = await this._userRepository.findById(
        updatedRequest.userId.toString()
      );
      const mentor = await this._mentorRepository.getMentorById(
        updatedRequest.mentorId.toString()
      );
      if (!user || !mentor || !mentor.userId) {
        throw new ServiceError(
          "User or mentor details not found",
          StatusCodes.NOT_FOUND
        );
      }
      const mentorUser = mentor.userId as Pick<IUser, "_id" | "name" | "email">;

      const userEmail = user.email;
      const userName = user.name;
      const mentorEmail = mentorUser.email;
      const mentorName = mentorUser.name;

      if (!userEmail || !mentorEmail) {
        throw new ServiceError(
          "User or mentor email not found",
          StatusCodes.NOT_FOUND
        );
      }

      const userSubject = "Mentor Request Acceptance Notice";
      const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been accepted. Please proceed with the payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(userEmail, userSubject, userText);
      logger.info(`Acceptance email sent to user: ${userEmail}`);

      const mentorSubject = "Mentor Request Acceptance Notice";
      const mentorText = `Dear ${mentorName},\n\nYou have accepted the mentor request from ${userName}. Awaiting payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(mentorEmail, mentorSubject, mentorText);
      logger.info(`Acceptance email sent to mentor: ${mentorEmail}`);

      await this._notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentorUser._id.toString(),
        requestId,
        "collaboration",
        undefined,
        undefined,
        `Your mentor request has been accepted by ${mentorUser.name}. Waiting for payment.`
      );
      logger.info(`Sent collaboration_status notification to user ${user._id}`);

      await this._notificationService.sendNotification(
        mentorUser._id.toString(),
        "collaboration_status",
        user._id.toString(),
        requestId,
        "collaboration",
        undefined,
        undefined,
        `You have accepted the mentor request from ${user.name}.`
      );
      logger.info(
        `Sent collaboration_status notification to mentor ${mentorUser._id}`
      );

      return toMentorRequestDTO(updatedRequest);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error accepting request ${requestId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to accept mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public rejectRequest = async (
    requestId: string
  ): Promise<IMentorRequestDTO | null> => {
    try {
      logger.debug(`Rejecting mentor request: ${requestId}`);
      if (!Types.ObjectId.isValid(requestId)) {
        throw new ServiceError(
          "Invalid request ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const updatedRequest = await this._collabRepository.updateMentorRequestStatus(
        requestId,
        "Rejected"
      );
      if (!updatedRequest) {
        throw new ServiceError(
          "Updating status of request failed",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const user = await this._userRepository.findById(
        updatedRequest.userId.toString()
      );
      const mentor = await this._mentorRepository.getMentorById(
        updatedRequest.mentorId.toString()
      );
      if (!user || !mentor || !mentor.userId) {
        throw new ServiceError(
          "User or mentor details not found",
          StatusCodes.NOT_FOUND
        );
      }
      const mentorUser = mentor.userId as Pick<IUser, "_id" | "name" | "email">;

      const userEmail = user.email;
      const userName = user.name;
      const mentorEmail = mentorUser.email;
      const mentorName = mentorUser.name;

      if (!userEmail || !mentorEmail) {
        throw new ServiceError(
          "User or mentor email not found",
          StatusCodes.NOT_FOUND
        );
      }

      const userSubject = "Mentor Request Rejection Notice";
      const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been rejected.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(userEmail, userSubject, userText);
      logger.info(`Rejection email sent to user: ${userEmail}`);

      const mentorSubject = "Mentor Request Rejection Notice";
      const mentorText = `Dear ${mentorName},\n\nYou have rejected the mentor request from ${userName}.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(mentorEmail, mentorSubject, mentorText);
      logger.info(`Rejection email sent to mentor: ${mentorEmail}`);

      await this._notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentorUser._id.toString(),
        requestId,
        "collaboration",
        undefined,
        undefined,
        `Your mentor request to ${mentorUser.name} has been rejected. Check your email for more details.`
      );
      logger.info(`Sent collaboration_status notification to user ${user._id}`);

      await this._notificationService.sendNotification(
        mentorUser._id.toString(),
        "collaboration_status",
        user._id.toString(),
        requestId,
        "collaboration",
        undefined,
        undefined,
        `You have rejected the mentor request from ${user.name}. Check your email for more details.`
      );
      logger.info(
        `Sent collaboration_status notification to mentor ${mentorUser._id}`
      );

      return toMentorRequestDTO(updatedRequest);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error rejecting request ${requestId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to reject mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getRequestForUser = async (
    userId: string
  ): Promise<IMentorRequestDTO[]> => {
    try {
      logger.debug(`Fetching requests for user: ${userId}`);
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError(
          "Invalid user ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const requests = await this._collabRepository.getRequestByUserId(userId);
      logger.info(
        `Fetched ${requests.length} mentor requests for userId: ${userId}`
      );
      return toMentorRequestDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching requests for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user requests",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };


  public processPaymentService = async (
  paymentMethodId: string,
  amount: number,
  requestId: string,
  mentorRequestData: Partial<IMentorRequest>,
  email: string,
  returnUrl: string
): Promise<{ paymentIntent: Stripe.PaymentIntent; contacts?: any[] }> => {
  try {
    logger.debug(`Processing payment for request: ${requestId}`);

    if (!mentorRequestData.mentorId || !mentorRequestData.userId) {
      throw new ServiceError(
        "Mentor ID and User ID are required",
        StatusCodes.BAD_REQUEST
      );
    }

    //Fetch mentor & user
    const mentor  = await this._mentorRepository.getMentorById(
      mentorRequestData.mentorId.toString()
    );
    if (!mentor || !mentor.userId) {
      throw new ServiceError(
        "Mentor or mentor’s userId not found",
        StatusCodes.NOT_FOUND
      );
    }
    const mentorUser = mentor.userId as Pick<IUser, "_id" | "name" | "email">;

    const user = await this._userRepository.findById(
      mentorRequestData.userId.toString()
    );
    if (!user) {
      throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
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

    // If payment not successful → no DB changes
    if (paymentIntent.status !== "succeeded") {
      return { paymentIntent };
    }

    // ---------- MONGODB TRANSACTION START ----------
    const session = await mongoose.startSession();
    let createdContacts: any[] | undefined;

    try {
      await session.withTransaction(async () => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        const totalSessions = mentorRequestData.timePeriod || 1;
        const sessionDay = mentorRequestData.selectedSlot?.day;

        if (!sessionDay) {
          throw new ServiceError(
            "Selected slot day is required",
            StatusCodes.BAD_REQUEST
          );
        }

        // Calculate endDate based on day & number of sessions
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

        // Create collaboration inside transaction
        const collaboration = await this._collabRepository.createCollaboration(
          {
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
          },
          session
        );

        const collaborationDTO = toCollaborationDTO(collaboration);
        if (!collaborationDTO) {
          logger.error(
            `Failed to map collaboration ${collaboration._id} to DTO`
          );
          throw new ServiceError(
            "Failed to map collaboration to DTO",
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        }
        logger.info(`Collaboration created: ${collaboration._id}`);

        // Create contacts inside transaction
        const [contact1, contact2] = await Promise.all([
          this._contactRepository.createContact(
            {
              userId: mentorRequestData.userId ? mentorRequestData.userId.toString() : undefined,
              targetUserId: mentorUser._id.toString(),
              collaborationId: collaboration._id,
              type: "user-mentor",
            },
            session
          ),
          this._contactRepository.createContact(
            {
              userId: mentorUser._id.toString(),
              targetUserId: mentorRequestData.userId ? mentorRequestData.userId.toString() : undefined,
              collaborationId: collaboration._id,
              type: "user-mentor",
            },
            session
          ),
        ]);

        createdContacts = [contact1, contact2];

        // Delete mentor request inside transaction
        await this._collabRepository.deleteMentorRequest(requestId, session);
      });

      // ---------- TRANSACTION COMMITTED SUCCESSFULLY ----------

      // Notifications & emails
      await this._notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentorUser._id.toString(),
        requestId,
        "collaboration",
        undefined,
        undefined,
        `Payment completed and collaboration created with ${mentorUser.name}!`
      );

      await this._notificationService.sendNotification(
          mentorUser._id.toString(),
          "collaboration_status",
          user._id.toString(),
          requestId,
          "collaboration",
          undefined,
          undefined,
          `${user.name}’s payment completed and collaboration created!`

      );

      return { paymentIntent, contacts: createdContacts };
    } finally {
      session.endSession();
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      `Error processing payment for request ${requestId}: ${err.message}`
    );
    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          "Failed to process payment",
          StatusCodes.INTERNAL_SERVER_ERROR,
          err
        );
  }
};

  //Check whether the collbaoration is completed
  private checkAndCompleteCollaboration = async (
    collab: ICollaboration
  ): Promise<ICollaborationDTO | null> => {
    try {
      const currentDate = new Date();
      if (
        !collab.isCancelled &&
        (collab.feedbackGiven ||
          (collab.endDate && collab.endDate <= currentDate))
      ) {
        logger.debug(`Marking collaboration ${collab._id} as complete`);

        const updatedCollab = await this._collabRepository.findByIdAndUpdateWithPopulate(
          collab._id.toString(),
          { isCompleted: true },
          { new: true }
        );

        const updatedCollabDTO = toCollaborationDTO(updatedCollab);
        if (!updatedCollabDTO) {
          logger.error(`Failed to map collaboration ${collab._id} to DTO`);
          throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
        }

       await this._contactRepository.deleteContact(
          collab._id.toString(),
          "user-mentor"
        );
        logger.info(
          `Collaboration ${collab._id} was completed, so associated contact was deleted`
        );

        return updatedCollabDTO;
      }
      const collabDTO = toCollaborationDTO(collab);
      if (!collabDTO) {
        logger.error(`Failed to map collaboration ${collab._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return collabDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error checking collaboration ${collab._id}: ${err.message}`
      );
      throw new ServiceError(
        "Failed to check and complete collaboration",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public getCollabDataForUserService = async (
    userId: string,
    includeCompleted: boolean = true
  ): Promise<ICollaborationDTO[]> => {
    try {
      logger.debug(`Fetching collaboration data for user: ${userId}`);
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError(
          "Invalid user ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const collaborations = await this._collabRepository.getCollabDataForUser(userId);
      const updatedCollaborations = await Promise.all(
        collaborations.map(async (collab) => {
          return await this.checkAndCompleteCollaboration(collab);
        })
      );
      const finalCollaborations = includeCompleted
      ? updatedCollaborations.filter((c): c is ICollaborationDTO => c !== null)
      : updatedCollaborations.filter((c): c is ICollaborationDTO => c !== null && !c.isCompleted);

    logger.info(
      `Fetched ${finalCollaborations.length} ${includeCompleted ? "total" : "active"} collaborations for userId: ${userId}`
    );
    return finalCollaborations;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching collaborations for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user collaborations",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getCollabDataForMentorService = async (
    mentorId: string,
    includeCompleted: boolean = true
  ): Promise<ICollaborationDTO[]> => {
    try {
      logger.debug(`Fetching collaboration data for mentor: ${mentorId}`);
      if (!Types.ObjectId.isValid(mentorId)) {
        throw new ServiceError(
          "Invalid mentor ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const collaborations = await this._collabRepository.getCollabDataForMentor(
        mentorId
      );
      const updatedCollaborations = await Promise.all(
        collaborations.map(async (collab) => {
          return await this.checkAndCompleteCollaboration(collab);
        })
      );
      const finalCollaborations = includeCompleted
      ? updatedCollaborations.filter((c): c is ICollaborationDTO => c !== null)
      : updatedCollaborations.filter((c): c is ICollaborationDTO => c !== null && !c.isCompleted);

    logger.info(
      `Fetched ${finalCollaborations.length} ${includeCompleted ? "total" : "active"} collaborations for userId: ${mentorId}`
    );
    return finalCollaborations;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching collaborations for mentor ${mentorId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor collaborations",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public cancelAndRefundCollab = async (
    collabId: string,
    reason: string,
    amount: number
  ): Promise<ICollaborationDTO | null> => {
    try {
      logger.debug(
        `Processing cancellation and refund for collaboration: ${collabId}`
      );
      if (!Types.ObjectId.isValid(collabId)) {
        throw new ServiceError(
          "Invalid collaboration ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      const collab = await this._collabRepository.findCollabById(collabId);
      if (!collab) {
        throw new ServiceError(
          "Collaboration not found",
          StatusCodes.NOT_FOUND
        );
      }
      if (!collab.payment) {
        throw new ServiceError(
          "No payment found for this collaboration",
          StatusCodes.BAD_REQUEST
        );
      }
      if (collab.isCancelled) {
        throw new ServiceError(
          "Collaboration is already cancelled",
          StatusCodes.BAD_REQUEST
        );
      }

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

      const updatedCollab = await this._collabRepository.markCollabAsCancelled(
        collabId
      );
      const updatedCollabDTO = toCollaborationDTO(updatedCollab);
      if (!updatedCollabDTO) {
        logger.error(`Failed to map collaboration ${updatedCollab?._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      await this._contactRepository.deleteContact(collabId, "user-mentor");

      const user = collab.userId as Pick<IUser, "_id" | "name" | "email">;
      const mentor = (collab.mentorId as { userId: Pick<IUser, "_id" | "name" | "email"> } ).userId;
      logger.info(`[cancel and Refund] user deatils : ${user}`);
      logger.info(`[cancel and Refund] mentor Details : ${mentor}`);

      if (!user.email || !mentor.email) {
        throw new ServiceError(
          "User or mentor email not found",
          StatusCodes.NOT_FOUND
        );
      }

      //Give notification here also

      await this._notificationService.sendNotification(
        user._id.toString(),
        "collaboration_status",
        mentor._id.toString(),
        collabId,
        "collaboration",
        undefined,
        undefined,
        `Your collaboration with ${mentor.name} cancelled.`
      );
      logger.info(`Sent collaboration_status 'cancelled' notification to user ${user._id}`);

      await this._notificationService.sendNotification(
        mentor._id.toString(),
        "collaboration_status",
        user._id.toString(),
        collabId,
        "collaboration",
        undefined,
        undefined,
        `You collaboration with ${user.name} cancelled`
      );
      logger.info(
        `Sent collaboration_status 'cancelled' to mentor ${mentor._id}`
      );

      const userSubject = "Mentorship Cancellation and Refund Notice";
      const userText = collab.paymentIntentId
        ? `Dear ${user.name},\n\nYour mentorship session with ${
            mentor.name
          } has been cancelled, and a 50% refund of Rs. ${amount.toFixed(
            2
          )} has been processed.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`
        : `Dear ${user.name},\n\nYour mentorship session with ${mentor.name} has been cancelled. No refund was processed due to missing payment details. Please contact support for assistance.\nReason: ${reason}\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(user.email, userSubject, userText);
      logger.info(`Cancellation and refund email sent to user: ${user.email}`);

      const mentorSubject = "Mentorship Session Cancellation Notice";
      const mentorText = `Dear ${mentor.name},\n\nWe regret to inform you that your mentorship session with ${user.name} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
      await sendEmail(mentor.email, mentorSubject, mentorText);
      logger.info(`Cancellation email sent to mentor: ${mentor.email}`);

      logger.info(
        `Collaboration ${collabId} cancelled${
          collab.paymentIntentId
            ? ` with 50% refund of Rs. ${amount.toFixed(2)}`
            : ""
        }`
      );
      return updatedCollabDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error cancelling collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to cancel and refund collaboration",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getMentorRequestsService = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{
    requests: IMentorRequestDTO[];
    total: number;
    page: number;
    pages: number;
  }> => {
    try {
      logger.debug(
        `Fetching mentor requests for admin with page: ${page}, limit: ${limit}, search: ${search}`
      );
      const result = await this._collabRepository.findMentorRequest({
        page,
        limit,
        search,
      });
      logger.info(
        `Fetched ${result.requests.length} mentor requests, total: ${result.total}`
      );
      return {
        requests: toMentorRequestDTOs(result.requests),
        total: result.total,
        page: result.page,
        pages: result.pages,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor requests: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor requests",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getCollabsService = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{
    collabs: ICollaborationDTO[];
    total: number;
    page: number;
    pages: number;
  }> => {
    try {
      logger.debug(
        `Fetching collaborations for admin with page: ${page}, limit: ${limit}, search: ${search}`
      );
      const {
        collabs,
        total,
        page: currentPage,
        pages,
      } = await this._collabRepository.findCollab({
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
        (collab): collab is ICollaborationDTO => collab !== null
      );
      logger.info(
        `Fetched ${filteredCollabs.length} collaborations, total: ${total}`
      );
      return { collabs: filteredCollabs, total, page: currentPage, pages };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaborations: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch collaborations",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public fetchCollabById = async (
    collabId: string
  ): Promise<ICollaborationDTO | null> => {
    try {
      logger.debug(`Fetching collaboration by ID: ${collabId}`);
      if (!Types.ObjectId.isValid(collabId)) {
        throw new ServiceError(
          "Invalid collaboration ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const collab = await this._collabRepository.findCollabById(collabId);
      const collabDTO = toCollaborationDTO(collab);
      if (!collabDTO && collab) {
        logger.error(`Failed to map collaboration ${collab._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(
        `Collaboration ${
          collab ? "found" : "not found"
        } for collabId: ${collabId}`
      );
      return collabDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching collaboration ${collabId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch collaboration",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public fetchRequestById = async (
    requestId: string
  ): Promise<IMentorRequestDTO | null> => {
    try {
      logger.debug(`Fetching request by ID: ${requestId}`);
      if (!Types.ObjectId.isValid(requestId)) {
        throw new ServiceError(
          "Invalid request ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const request = await this._collabRepository.fetchMentorRequestDetails(
        requestId
      );
      const requestDTO = toMentorRequestDTO(request);
      if (!requestDTO && request) {
        logger.error(`Failed to map mentor request ${request._id} to DTO`);
        throw new ServiceError("Failed to map mentor request to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(
        `Mentor request ${
          request ? "found" : "not found"
        } for requestId: ${requestId}`
      );
      return requestDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching request ${requestId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public markUnavailableDaysService = async (
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaborationDTO | null> => {
    try {
      logger.debug(`Marking unavailable days for collaboration: ${collabId}`);
      if (!Types.ObjectId.isValid(collabId)) {
        throw new ServiceError(
          "Invalid collaboration ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const collaboration = await this._collabRepository.updateUnavailableDays(
        collabId,
        updateData
      );
      const collaborationDTO = toCollaborationDTO(collaboration);
      if (!collaborationDTO && collaboration) {
        logger.error(`Failed to map collaboration ${collaboration._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(`Updated unavailable days for collaboration ${collabId}`);
      return collaborationDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error marking unavailable days for collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to mark unavailable days",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public updateTemporarySlotChangesService = async (
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaborationDTO | null> => {
    try {
      logger.debug(
        `Updating temporary slot changes for collaboration: ${collabId}`
      );
      if (!Types.ObjectId.isValid(collabId)) {
        throw new ServiceError(
          "Invalid collaboration ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const collaboration = await this._collabRepository.updateTemporarySlotChanges(
        collabId,
        updateData
      );
      const collaborationDTO = toCollaborationDTO(collaboration);
      if (!collaborationDTO && collaboration) {
        logger.error(`Failed to map collaboration ${collaboration._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      logger.info(
        `Updated temporary slot changes for collaboration ${collabId}`
      );
      return collaborationDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error updating temporary slot changes for collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update temporary slot changes",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public processTimeSlotRequest = async (
    collabId: string,
    requestId: string,
    isApproved: boolean,
    requestType: "unavailable" | "timeSlot"
  ): Promise<ICollaborationDTO | null> => {
    try {
      logger.debug(
        `Processing time slot request for collaboration: ${collabId}`
      );
      if (
        !Types.ObjectId.isValid(collabId) ||
        !Types.ObjectId.isValid(requestId)
      ) {
        throw new ServiceError(
          "Invalid collaboration ID or request ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      const collaboration = await this._collabRepository.findCollabById(collabId);
      if (!collaboration) {
        throw new ServiceError(
          "Collaboration not found",
          StatusCodes.NOT_FOUND
        );
      }

      let requestedBy: "user" | "mentor" | undefined;
      if (requestType === "unavailable") {
        const request = collaboration.unavailableDays.find(
          (req) => req._id.toString() === requestId
        );
        if (!request) {
          throw new ServiceError(
            "Unavailable days request not found",
            StatusCodes.NOT_FOUND
          );
        }
        requestedBy = request.requestedBy;
      } else {
        const request = collaboration.temporarySlotChanges.find(
          (req) => req._id.toString() === requestId
        );
        if (!request) {
          throw new ServiceError(
            "Time slot change request not found",
            StatusCodes.NOT_FOUND
          );
        }
        requestedBy = request.requestedBy;
      }

      if (!requestedBy) {
        throw new ServiceError(
          "Unable to determine who requested the change",
          StatusCodes.BAD_REQUEST
        );
      }

      let newEndDate: Date | undefined;
      if (requestType === "unavailable" && isApproved) {
        const request = collaboration.unavailableDays.find(
          (req) => req._id.toString() === requestId
        );
        if (request) {
          const unavailableDates = request.datesAndReasons.map(
            (item) => new Date(item.date)
          );
          const selectedDay = collaboration.selectedSlot[0]?.day;
          if (!selectedDay) {
            throw new ServiceError(
              "Selected slot day not found",
              StatusCodes.BAD_REQUEST
            );
          }
          const currentEndDate =
            collaboration.endDate || collaboration.startDate;
          newEndDate = this.calculateNewEndDate(
            currentEndDate,
            unavailableDates,
            selectedDay
          );
        }
      }

      const status = isApproved ? "approved" : "rejected";
      const updatedCollaboration = await this._collabRepository.updateRequestStatus(
        collabId,
        requestId,
        requestType,
        status,
        newEndDate
      );

      const updatedCollaborationDTO = toCollaborationDTO(updatedCollaboration);
      if (!updatedCollaborationDTO && updatedCollaboration) {
        logger.error(`Failed to map collaboration ${updatedCollaboration._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      if (status === "rejected") {
        const user = collaboration.userId as Pick<IUser, "name" | "email">;
        const mentor = (
          collaboration.mentorId as { userId: Pick<IUser, "name" | "email"> }
        ).userId;

        if (!user.email || !mentor.email) {
          throw new ServiceError(
            "User or mentor email not found",
            StatusCodes.NOT_FOUND
          );
        }

        const recipientEmail =
          requestedBy === "user" ? mentor.email : user.email;
        const recipientName = requestedBy === "user" ? mentor.name : user.name;
        const otherPartyName = requestedBy === "user" ? user.name : mentor.name;

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

      logger.info(
        `Processed time slot request for collaboration ${collabId}: ${status}`
      );
      return updatedCollaborationDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error processing time slot request for collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to process time slot request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getMentorLockedSlots = async (
    mentorId: string
  ): Promise<LockedSlot[]> => {
    try {
      logger.debug(`Fetching locked slots for mentor: ${mentorId}`);
      if (!Types.ObjectId.isValid(mentorId)) {
        throw new ServiceError(
          "Invalid mentor ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }
      const lockedSlots = await this._collabRepository.getLockedSlotsByMentorId(
        mentorId
      );
      logger.info(
        `Fetched ${lockedSlots.length} locked slots for mentorId: ${mentorId}`
      );
      return lockedSlots;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching locked slots for mentor ${mentorId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch locked slots",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public calculateNewEndDate = (
    currentEndDate: Date,
    unavailableDates: Date[],
    selectedDay: string
  ): Date => {
    try {
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
      if (selectedDayOfWeek === undefined) {
        throw new ServiceError("Invalid selected day", StatusCodes.BAD_REQUEST);
      }
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error calculating new end date: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to calculate new end date",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getReceiptData = async (
    collabId: string
  ): Promise<{
    mentorUser: { name: string; email: string };
    user: { name: string; email: string; _id: Types.ObjectId };
    paymentIntent: Stripe.PaymentIntent;
    collab: ICollaborationDTO;
  }> => {
    try {
      logger.debug(`Fetching receipt data for collaboration: ${collabId}`);
      if (!Types.ObjectId.isValid(collabId)) {
        throw new ServiceError(
          "Invalid collaboration ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      const collab = await this._collabRepository.findCollabById(collabId);
      if (!collab || !collab.paymentIntentId) {
        throw new ServiceError(
          "Collaboration or payment not found",
          StatusCodes.NOT_FOUND
        );
      }

      const collabDTO = toCollaborationDTO(collab);
      logger.debug("Collaboartion DTO Structure : ",collabDTO)
      if (!collabDTO) {
        logger.error(`Failed to map collaboration ${collab._id} to DTO`);
        throw new ServiceError("Failed to map collaboration to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        collab.paymentIntentId
      );
      if (!paymentIntent) {
        throw new ServiceError(
          "Payment intent not found",
          StatusCodes.NOT_FOUND
        );
      }
      const mentorId = (collab.mentorId as IMentor)._id.toString();
      const mentor = await this._mentorRepository.getMentorById(mentorId);
      if (!mentor || !mentor.userId) {
        throw new ServiceError(
          "Mentor or mentor’s userId not found",
          StatusCodes.NOT_FOUND
        );
      }
      const mentorUser = mentor.userId as { name: string; email: string };

      const userId = (collab.userId as IUser)._id.toString()
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      return { mentorUser, user, paymentIntent, collab: collabDTO };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching receipt data for collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch receipt data",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public generateReceiptPDF = async (collabId: string): Promise<Buffer> => {
    try {
      logger.debug(`Generating PDF receipt for collaboration: ${collabId}`);
      const { mentorUser, user, paymentIntent, collab } =
        await this.getReceiptData(collabId);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on("error", (error: Error) => {
          logger.error(
            `Error generating PDF for collabId ${collabId}: ${error.message}`
          );
          reject(
            new ServiceError(
              "Failed to generate PDF",
              StatusCodes.INTERNAL_SERVER_ERROR,
              error
            )
          );
        });

        doc.fontSize(20).text("Payment Receipt", { align: "center" });
        doc
          .fontSize(14)
          .text("ConnectSphere Mentorship Platform", { align: "center" });
        doc.fontSize(10).text(
          `Issued on: ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          { align: "center" }
        );
        doc.moveDown(2);

        doc.fontSize(12).text("Receipt Details", { underline: true });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(`Collaboration ID: ${collab.collaborationId || collab.id}`);
        doc.text(`Mentor: ${mentorUser.name}`);
        doc.text(`User: ${user.name}`);
        doc.text(`Amount: INR ${collab.price.toFixed(2)}`);
        doc.text(
          `Payment Date: ${
            paymentIntent.created
              ? new Date(paymentIntent.created * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "Unknown"
          }`
        );
        doc.text(`Payment ID: ${paymentIntent.id}`);
        doc.text(
          `Status: ${
            paymentIntent.status.charAt(0).toUpperCase() +
            paymentIntent.status.slice(1)
          }`
        );
        doc.moveDown(2);

        doc.fontSize(12).text("Description", { underline: true });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(
            `Payment for mentorship session with ${mentorUser.name} from ` +
              `${
                collab.startDate
                  ? new Date(collab.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not specified"
              } to ` +
              `${
                collab.endDate
                  ? new Date(collab.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not specified"
              }`
          );
        doc.moveDown(2);

        doc.fontSize(12).text("Contact Information", { underline: true });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(
            "For any inquiries, please contact ConnectSphere support at support@connectsphere.com."
          );

        doc.end();
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error generating PDF receipt for collaboration ${collabId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to generate PDF receipt",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }

  public deleteMentorRequestService = async (requestId: string): Promise<void> => {
  try {
    logger.debug(`Deleting mentor request in service: ${requestId}`);

    if (!Types.ObjectId.isValid(requestId)) {
      throw new ServiceError(
        "Invalid request ID: must be a 24 character hex string",
        StatusCodes.BAD_REQUEST
      );
    }

    await this._collabRepository.deleteMentorRequest(requestId);
    logger.info(`Mentor request deleted: ${requestId}`);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error deleting mentor request ${requestId}: ${err.message}`);
    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          "Failed to delete mentor request",
          StatusCodes.INTERNAL_SERVER_ERROR,
          err
        );
  }
};
}
