import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import MentorRequest from "../Models/mentor-requset-model";
import { IMentorRequest } from "../Interfaces/Models/i-mentor-request";
import logger from "../core/utils/logger";
import { ICollaborationController } from "../Interfaces/Controller/i-collaboration-controller";
import { HttpError } from "../core/utils/error-handler";
import { StatusCodes } from "../enums/status-code-enums";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
import { inject, injectable } from "inversify";
import { COLLABORATION_MESSAGES } from "../constants/messages";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class CollaborationController extends BaseController implements ICollaborationController{
  private _collabService: ICollaborationService;

  constructor(@inject('ICollaborationService') collaborationService : ICollaborationService) {
    super();
    this._collabService = collaborationService;
  }

  TemporaryRequestController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId, userId, selectedSlot, price, timePeriod } = req.body;
      logger.info(req.body);

      const requestData = { mentorId, userId, selectedSlot, price, timePeriod };
      const newRequest = await this._collabService.TemporaryRequestService(requestData);
      this.sendCreated(res, newRequest, COLLABORATION_MESSAGES.REQUEST_CREATED);
    } catch (error: any) {
      next(error);
    }
  };

  getMentorRequestsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mentorId = req.query.mentorId as string;
      if (!mentorId) {
        throw new HttpError(ERROR_MESSAGES.MENTOR_ID_REQUIRED, StatusCodes.BAD_REQUEST);
      }
      const mentorRequests = await this._collabService.getMentorRequests(mentorId);
      if (mentorRequests.length === 0) {
        this.sendSuccess(res, { requests: [] }, COLLABORATION_MESSAGES.NO_MENTOR_REQUESTS_FOUND);
        logger.info(`No mentor requests found for mentorId: ${mentorId}`);
        return;
      }
      this.sendSuccess(res, { requests: mentorRequests }, COLLABORATION_MESSAGES.MENTOR_REQUESTS_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  acceptRequestController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this._collabService.acceptRequest(id);
      this.sendSuccess(res, { request }, COLLABORATION_MESSAGES.REQUEST_ACCEPTED);
    } catch (error: any) {
      next(error);
    }
  };

  rejectRequestController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this._collabService.rejectRequest(id);
      this.sendSuccess(res, { request }, COLLABORATION_MESSAGES.REQUEST_REJECTED);
    } catch (error: any) {
      next(error);
    }
  };

  getRequestForUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRequest = await this._collabService.getRequestForUser(id);
      if (userRequest.length === 0) {
        this.sendSuccess(res, { requests: [] }, COLLABORATION_MESSAGES.NO_REQUESTS_FOUND);
        logger.info(`No mentor requests found for userId: ${id}`);
        return;
      }
      this.sendSuccess(res, { requests: userRequest }, COLLABORATION_MESSAGES.REQUEST_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  makeStripePaymentController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentMethodId, amount, requestId, email, returnUrl } = req.body;
      if (!returnUrl) {
        throw new HttpError(ERROR_MESSAGES.RETURN_URL_REQUIRED, StatusCodes.BAD_REQUEST);
      }
      const mentorRequestData = await MentorRequest.findById(requestId);
      if (!mentorRequestData) {
        throw new HttpError(ERROR_MESSAGES.MENTOR_REQUEST_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      const paymentResult = await this._collabService.processPaymentService(
        paymentMethodId,
        amount,
        requestId,
        mentorRequestData as Partial<IMentorRequest>,
        email,
        returnUrl
      );
      const paymentIntent = "paymentIntent" in paymentResult ? paymentResult.paymentIntent : paymentResult;
      if (paymentIntent.status === "requires_action" && paymentIntent.next_action) {
        this.sendSuccess(res, { status: "requires_action", charge: paymentIntent }, COLLABORATION_MESSAGES.PAYMENT_REQUIRES_ACTION);
      } else if (paymentIntent.status === "succeeded") {
        this.sendSuccess(
          res,
          { status: "success", charge: paymentIntent, contacts: paymentResult.contacts },
          COLLABORATION_MESSAGES.PAYMENT_SUCCEEDED
        );
      } else {
        this.sendSuccess(
          res,
          { status: paymentIntent.status, charge: paymentIntent },
          `${COLLABORATION_MESSAGES.PAYMENT_STATUS}${paymentIntent.status}`
        );
      }
    } catch (error: any) {
      next(error);
    }
  };

  getCollabDataForUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeCompleted } = req.body;
      const collabData = await this._collabService.getCollabDataForUserService(id, includeCompleted);
      if (collabData.length === 0) {
        this.sendSuccess(res, { collabData: [] }, COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND);
        logger.info(`No collaborations found for userId: ${id}`);
        return;
      }
      this.sendSuccess(res, { collabData }, COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  getCollabDataForMentorController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeCompleted} = req.body;
      const collabData = await this._collabService.getCollabDataForMentorService(id, includeCompleted);
      if (collabData.length === 0) {
        this.sendSuccess(res, { collabData: [] }, COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND);
        logger.info(`No collaborations found for mentorId: ${id}`);
        return;
      }
      this.sendSuccess(res, { collabData }, COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  cancelAndRefundCollab = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { reason, amount } = req.body;
      logger.info("Processing cancellation and refund with data:", { collabId, reason, amount });
      if (!reason || !amount) {
        throw new HttpError(ERROR_MESSAGES.REASON_AND_AMOUNT_REQUIRED, StatusCodes.BAD_REQUEST);
      }
      const updatedCollab = await this._collabService.cancelAndRefundCollab(collabId, reason, amount);
      this.sendSuccess(res, updatedCollab, COLLABORATION_MESSAGES.COLLABORATION_CANCELLED_WITH_REFUND);
    } catch (error: any) {
      next(error);
    }
  };

  getAllMentorRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_PAGE_NUMBER, StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_LIMIT_VALUE, StatusCodes.BAD_REQUEST);
      }
      logger.debug(`Fetching all mentor requests with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`);
      const mentorRequests = await this._collabService.getMentorRequestsService({
        page: parsedPage,
        limit: parsedLimit,
        search: search as string,
      });
      if (mentorRequests.requests.length === 0) {
        this.sendSuccess(
          res,
          { requests: [], total: 0, page: parsedPage, pages: 1 },
          COLLABORATION_MESSAGES.NO_MENTOR_REQUESTS_FOUND
        );
        logger.info(`No mentor requests found for search: ${search}`);
        return;
      }
      this.sendSuccess(res, mentorRequests, COLLABORATION_MESSAGES.MENTOR_REQUESTS_RETRIEVED);
    } catch (error: any) {
      logger.error(`Error fetching all mentor requests: ${error.message}`);
      next(error);
    }
  };

  getAllCollabs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_PAGE_NUMBER, StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_LIMIT_VALUE, StatusCodes.BAD_REQUEST);
      }
      logger.debug(`Fetching all collaborations with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`);
      const collaborations = await this._collabService.getCollabsService({
        page: parsedPage,
        limit: parsedLimit,
        search: search as string,
      });
      if (collaborations.collabs.length === 0) {
        this.sendSuccess(
          res,
          { collabs: [], total: 0, page: parsedPage, pages: 1 },
          COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND
        );
        logger.info(`No collaborations found for search: ${search}`);
        return;
      }
      this.sendSuccess(res, collaborations, COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
    } catch (error: any) {
      logger.error(`Error fetching all collaborations: ${error.message}`);
      next(error);
    }
  };

  getCollabDetailsByCollabId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { collabId } = req.params;
    try {
      logger.debug(`Fetching collaboration details for collabId: ${collabId}`);
      const collabDetails = await this._collabService.fetchCollabById(collabId);
      if (!collabDetails) {
        this.sendSuccess(res, { collabData: null }, COLLABORATION_MESSAGES.NO_COLLABORATION_FOUND);
        logger.info(`No collaboration found for collabId: ${collabId}`);
        return;
      }
      this.sendSuccess(res, collabDetails, COLLABORATION_MESSAGES.COLLABORATION_DETAILS_ACCESSED);
    } catch (error: any) {
      logger.error(`Error fetching collaboration details for collabId ${collabId || "unknown"}: ${error.message}`);
      next(error);
    }
  };

  getRequestDetailsByRequestId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { requestId } = req.params;
    try {
      logger.debug(`Fetching request details for requestId: ${requestId}`);
      const requestDetails = await this._collabService.fetchRequestById(requestId);
      if (!requestDetails) {
        this.sendSuccess(res, { requests: null }, COLLABORATION_MESSAGES.NO_REQUEST_FOUND);
        logger.info(`No mentor request found for requestId: ${requestId}`);
        return;
      }
      this.sendSuccess(res, requestDetails, COLLABORATION_MESSAGES.REQUEST_DETAILS_ACCESSED);
    } catch (error: any) {
      logger.error(`Error fetching request details for requestId ${requestId || "unknown"}: ${error.message}`);
      next(error);
    }
  };

  markUnavailableDays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { datesAndReasons, requestedBy, requesterId, approvedById, isApproved } = req.body;
      const updatedCollaboration = await this._collabService.markUnavailableDaysService(collabId, {
        datesAndReasons,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      });
      this.sendSuccess(res, updatedCollaboration, COLLABORATION_MESSAGES.UNAVAILABLE_DAYS_UPDATED);
    } catch (error: any) {
      next(error);
    }
  };

  updateTemporarySlotChanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { datesAndNewSlots, requestedBy, requesterId, approvedById, isApproved } = req.body;
      const updatedCollaboration = await this._collabService.updateTemporarySlotChangesService(collabId, {
        datesAndNewSlots,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      });
      this.sendSuccess(res, updatedCollaboration, COLLABORATION_MESSAGES.TEMPORARY_SLOT_CHANGES_UPDATED);
    } catch (error: any) {
      next(error);
    }
  };

  approveTimeSlotRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { requestId, isApproved, requestType } = req.body;
      const updatedCollaboration = await this._collabService.processTimeSlotRequest(collabId, requestId, isApproved, requestType);
      this.sendSuccess(res, updatedCollaboration, COLLABORATION_MESSAGES.TIME_SLOT_REQUEST_PROCESSED);
    } catch (error: any) {
      next(error);
    }
  };

  getMentorLockedSlotsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { mentorId } = req.params;
    try {
      if (!mentorId) {
        throw new HttpError(ERROR_MESSAGES.MENTOR_ID_REQUIRED, StatusCodes.BAD_REQUEST);
      }
      logger.debug(`Fetching locked slots for mentorId: ${mentorId}`);
      const lockedSlots = await this._collabService.getMentorLockedSlots(mentorId);
      if (lockedSlots.length === 0) {
        this.sendSuccess(res, { lockedSlots: [] }, COLLABORATION_MESSAGES.NO_LOCKED_SLOTS_FOUND);
        logger.info(`No locked slots found for mentorId: ${mentorId}`);
        return;
      }
      this.sendSuccess(res, { lockedSlots }, COLLABORATION_MESSAGES.LOCKED_SLOTS_RETRIEVED);
    } catch (error: any) {
      logger.error(`Error fetching locked slots for mentorId ${mentorId || "unknown"}: ${error.message}`);
      next(error);
    }
  };

  downloadReceiptController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { collabId } = req.params;
    try {
      logger.debug(`Request to download receipt for collabId: ${collabId}`);
      const pdfBuffer = await this._collabService.generateReceiptPDF(collabId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=receipt-${collabId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      logger.error(`Error generating receipt for collabId ${collabId}: ${error.message}`);
      next(error);
    }
  };

  public deleteMentorRequestController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await this._collabService.deleteMentorRequestService(id);
    this.sendSuccess(res, null, "Mentor request deleted successfully");
  } catch (error) {
    next(error);
  }
};
}
