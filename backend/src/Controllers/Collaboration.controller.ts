import { Request, Response, NextFunction } from "express";
import { BaseController } from "../Core/Controller/BaseController";
import MentorRequest from "../Models/mentorRequset";
import { IMentorRequest } from "../Interfaces/Models/IMentorRequest";
import logger from "../Core/Utils/Logger";
import { ICollaborationController } from "../Interfaces/Controller/ICollaborationController";
import { HttpError } from "../Core/Utils/ErrorHandler";
import { StatusCodes } from "../Enums/StatusCode.constants";
import { ICollaborationService } from "../Interfaces/Services/ICollaborationService";
import { inject } from "inversify";

export class CollaborationController extends BaseController implements ICollaborationController{
  private _collabService: ICollaborationService;

  constructor(@inject('ICollaborationService') collaborationService : ICollaborationService) {
    super();
    this._collabService = collaborationService;
  }

  TemporaryRequestController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { mentorId, userId, selectedSlot, price, timePeriod } = req.body;
      logger.info(req.body);

      const requestData = { mentorId, userId, selectedSlot, price, timePeriod };
      const newRequest = await this._collabService.TemporaryRequestService(
        requestData
      );
      this.sendCreated(res, newRequest, "Request created successfully");
    } catch (error: any) {
      next(error)
    }
  };

  getMentorRequestsController = async (
    req: Request,
    res: Response,
    next:NextFunction
  ): Promise<void> => {
    try {
      const mentorId = req.query.mentorId as string;
      if (!mentorId) {
       throw new HttpError("Mentor ID is required", StatusCodes.BAD_REQUEST);
      }
      const mentorRequests = await this._collabService.getMentorRequests(
        mentorId
      );
      if (mentorRequests.length === 0) {
        this.sendSuccess(res, { requests: [] }, "No mentor requests found");
        logger.info(`No mentor requests found for mentorId: ${mentorId}`);
        return;
      }
      this.sendSuccess(
        res,
        { requests: mentorRequests },
        "Mentor requests retrieved successfully"
      );
    } catch (error: any) {
      next(error)
    }
  };

  acceptRequestController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this._collabService.acceptRequest(id);
      this.sendSuccess(res, { request }, "Request accepted");
    } catch (error: any) {
      next(error)
    }
  };

  rejectRequestController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this._collabService.rejectRequest(id);
      this.sendSuccess(res, { request }, "Request rejected");
    } catch (error: any) {
      next(error)
    }
  };

  getRequestForUserController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userRequest = await this._collabService.getRequestForUser(id);
      if (userRequest.length === 0) {
        this.sendSuccess(res, { requests: [] }, "No mentor requests found");
        logger.info(`No mentor requests found for userId: ${id}`);
        return;
      }
      this.sendSuccess(
        res,
        { requests: userRequest },
        "Request retrieved successfully"
      );
    } catch (error: any) {
      next(error)
    }
  };

  makeStripePaymentController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { paymentMethodId, amount, requestId, email, returnUrl } = req.body;
      if (!returnUrl) {
       throw new HttpError(
          "A return URL is required for processing the payment", StatusCodes.BAD_REQUEST
        );
      }
      const mentorRequestData = await MentorRequest.findById(requestId);
      if (!mentorRequestData) {
       throw new HttpError("Mentor request not found", 404);
      }
      const paymentResult = await this._collabService.processPaymentService(
        paymentMethodId,
        amount,
        requestId,
        mentorRequestData as Partial<IMentorRequest>,
        email,
        returnUrl
      );
      const paymentIntent =
        "paymentIntent" in paymentResult
          ? paymentResult.paymentIntent
          : paymentResult;
      if (
        paymentIntent.status === "requires_action" &&
        paymentIntent.next_action
      ) {
        this.sendSuccess(
          res,
          { status: "requires_action", charge: paymentIntent },
          "Payment requires action"
        );
      } else if (paymentIntent.status === "succeeded") {
        this.sendSuccess(
          res,
          {
            status: "success",
            charge: paymentIntent,
            contacts: paymentResult.contacts,
          },
          "Payment succeeded"
        );
      } else {
        this.sendSuccess(
          res,
          { status: paymentIntent.status, charge: paymentIntent },
          `Payment status: ${paymentIntent.status}`
        );
      }
    } catch (error: any) {
      next(error)
    }
  };

  getCollabDataForUserController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const collabData = await this._collabService.getCollabDataForUserService(
        id
      );
      if (collabData.length === 0) {
        this.sendSuccess(res, { collabData: [] }, "No collaborations found");
        logger.info(`No collaborations found for userId: ${id}`);
        return;
      }
      this.sendSuccess(
        res,
        { collabData },
        "Collaboration data retrieved successfully"
      );
    } catch (error: any) {
      next(error)
    }
  };

  getCollabDataForMentorController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const collabData = await this._collabService.getCollabDataForMentorService(
        id
      );
      if (collabData.length === 0) {
        this.sendSuccess(res, { collabData: [] }, "No collaborations found");
        logger.info(`No collaborations found for mentorId: ${id}`);
        return;
      }
      this.sendSuccess(
        res,
        { collabData },
        "Collaboration data retrieved successfully"
      );
    } catch (error: any) {
      next(error)
    }
  };

  cancelAndRefundCollab = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { reason, amount } = req.body;
      logger.info("Processing cancellation and refund with data:", {
        collabId,
        reason,
        amount,
      });
      if (!reason || !amount) {
       throw new HttpError("Reason and amount are required", StatusCodes.BAD_REQUEST);
      }
      const updatedCollab = await this._collabService.cancelAndRefundCollab(
        collabId,
        reason,
        amount
      );
      this.sendSuccess(
        res,
        updatedCollab,
        "Collaboration cancelled with refund"
      );
    } catch (error: any) {
      next(error)
    }
  };

  getAllMentorRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
       throw new HttpError("Invalid page number", StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
       throw new HttpError("Invalid limit value", StatusCodes.BAD_REQUEST);
      }
      logger.debug(
        `Fetching all mentor requests with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`
      );
      const mentorRequests = await this._collabService.getMentorRequestsService({
        page: parsedPage,
        limit: parsedLimit,
        search: search as string,
      });
      if (mentorRequests.requests.length === 0) {
        this.sendSuccess(
          res,
          { requests: [], total: 0, page: parsedPage, pages: 1 },
          "No mentor requests found"
        );
        logger.info(`No mentor requests found for search: ${search}`);
        return;
      }
      this.sendSuccess(
        res,
        mentorRequests,
        "Mentor requests retrieved successfully"
      );
    } catch (error: any) {
      logger.error(`Error fetching all mentor requests: ${error.message}`);
      next(error)
    }
  };

  getAllCollabs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
       throw new HttpError("Invalid page number", StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
       throw new HttpError("Invalid limit value", StatusCodes.BAD_REQUEST);
      }
      logger.debug(
        `Fetching all collaborations with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`
      );
      const collaborations = await this._collabService.getCollabsService({
        page: parsedPage,
        limit: parsedLimit,
        search: search as string,
      });
      if (collaborations.collabs.length === 0) {
        this.sendSuccess(
          res,
          { collabs: [], total: 0, page: parsedPage, pages: 1 },
          "No collaborations found"
        );
        logger.info(`No collaborations found for search: ${search}`);
        return;
      }
      this.sendSuccess(
        res,
        collaborations,
        "Collaborations retrieved successfully"
      );
    } catch (error: any) {
      logger.error(`Error fetching all collaborations: ${error.message}`);
      next(error)
    }
  };

  getCollabDetailsByCollabId = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    const { collabId } = req.params;
    try {
      logger.debug(`Fetching collaboration details for collabId: ${collabId}`);
      const collabDetails = await this._collabService.fetchCollabById(collabId);
      if (!collabDetails) {
        this.sendSuccess(res, { collabData: null }, "No collaboration found");
        logger.info(`No collaboration found for collabId: ${collabId}`);
        return;
      }
      this.sendSuccess(
        res,
        collabDetails,
        "Collaboration details accessed successfully"
      );
    } catch (error: any) {
      logger.error(
        `Error fetching collaboration details for collabId ${
          collabId || "unknown"
        }: ${error.message}`
      );
      next(error)
    }
  };

  getRequestDetailsByRequestId = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    const { requestId } = req.params;
    try {
      logger.debug(`Fetching request details for requestId: ${requestId}`);
      const requestDetails = await this._collabService.fetchRequestById(
        requestId
      );
      if (!requestDetails) {
        this.sendSuccess(res, { requests: null }, "No mentor request found");
        logger.info(`No mentor request found for requestId: ${requestId}`);
        return;
      }
      this.sendSuccess(
        res,
        requestDetails,
        "Request details accessed successfully"
      );
    } catch (error: any) {
      logger.error(
        `Error fetching request details for requestId ${
          requestId || "unknown"
        }: ${error.message}`
      );
      next(error)
    }
  };

  markUnavailableDays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      const {
        datesAndReasons,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      } = req.body;
      const updatedCollaboration =
        await this._collabService.markUnavailableDaysService(collabId, {
          datesAndReasons,
          requestedBy,
          requesterId,
          approvedById,
          isApproved,
        });
      this.sendSuccess(res, updatedCollaboration, "Unavailable days updated");
    } catch (error: any) {
      next(error)
    }
  };

  updateTemporarySlotChanges = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { collabId } = req.params;
      const {
        datesAndNewSlots,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      } = req.body;
      const updatedCollaboration =
        await this._collabService.updateTemporarySlotChangesService(collabId, {
          datesAndNewSlots,
          requestedBy,
          requesterId,
          approvedById,
          isApproved,
        });
      this.sendSuccess(
        res,
        updatedCollaboration,
        "Temporary slot changes updated"
      );
    } catch (error: any) {
      next(error)
    }
  };

  approveTimeSlotRequest = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      const { collabId } = req.params;
      const { requestId, isApproved, requestType } = req.body;
      const updatedCollaboration =
        await this._collabService.processTimeSlotRequest(
          collabId,
          requestId,
          isApproved,
          requestType
        );
      this.sendSuccess(
        res,
        updatedCollaboration,
        "Time slot request processed successfully"
      );
    } catch (error: any) {
      next(error)
    }
  };

  getMentorLockedSlotsController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    const { mentorId } = req.params;
    try {
      if (!mentorId) {
       throw new HttpError("Mentor ID is required", StatusCodes.BAD_REQUEST);
      }
      logger.debug(`Fetching locked slots for mentorId: ${mentorId}`);
      const lockedSlots = await this._collabService.getMentorLockedSlots(
        mentorId
      );
      if (lockedSlots.length === 0) {
        this.sendSuccess(res, { lockedSlots: [] }, "No locked slots found");
        logger.info(`No locked slots found for mentorId: ${mentorId}`);
        return;
      }
      this.sendSuccess(
        res,
        { lockedSlots },
        "Locked slots retrieved successfully"
      );
    } catch (error: any) {
      logger.error(
        `Error fetching locked slots for mentorId ${mentorId || "unknown"}: ${
          error.message
        }`
      );
      next(error)
    }
  };

  downloadReceiptController = async (
    req: Request,
    res: Response, next: NextFunction
  ): Promise<void> => {
    const { collabId } = req.params;
    try {
      logger.debug(`Request to download receipt for collabId: ${collabId}`);

      // Generate PDF from service
      const pdfBuffer = await this._collabService.generateReceiptPDF(collabId);

      // Send PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${collabId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      logger.error(
        `Error generating receipt for collabId ${collabId}: ${error.message}`
      );
      next(error)
    }
  }
}
