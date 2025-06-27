import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController';
import { CollaborationService } from '../Service/CollaborationService';
import MentorRequest from '../../../models/mentorRequset';
import { IMentorRequest } from '../../../Interfaces/models/IMentorRequest';
// import logger from '../../../core/utils/Logger';

export class CollaborationController extends BaseController {
  private collabService: CollaborationService;

  constructor() {
    super();
    this.collabService = new CollaborationService();
  }


  TemporaryRequestController = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { mentorId, userId, selectedSlot, price, timePeriod } = req.body;
      if (!mentorId || !userId || !selectedSlot || !price || !timePeriod) {
        this.throwError(400, 'All fields are required');
      }
      const requestData = { mentorId, userId, selectedSlot, price, timePeriod };
      const newRequest = await this.collabService.TemporaryRequestService(requestData);
      this.sendCreated(res, newRequest, 'Request created successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getMentorRequestsController =async(req: Request, res: Response): Promise<void> =>{
    try {
      const mentorId = req.query.mentorId as string;
      if (!mentorId) {
        this.throwError(400, 'Mentor ID is required');
      }
      const mentorRequests = await this.collabService.getMentorRequests(mentorId);
      this.sendSuccess(res, { requests: mentorRequests }, 'Mentor requests retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  acceptRequestController = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const request = await this.collabService.acceptRequest(id);
      this.sendSuccess(res, { request }, 'Request accepted');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  rejectRequestController = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const request = await this.collabService.rejectRequest(id);
      this.sendSuccess(res, { request }, 'Request rejected');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getRequestForUserController = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const userRequest = await this.collabService.getRequestForUser(id);
      this.sendSuccess(res, { requests: userRequest }, 'Request retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  makeStripePaymentController = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { paymentMethodId, amount, requestId, email, returnUrl } = req.body;
      if (!returnUrl) {
        this.throwError(400, 'A return URL is required for processing the payment');
      }
      const mentorRequestData = await MentorRequest.findById(requestId);
      if (!mentorRequestData) {
        this.throwError(404, 'Mentor request not found');
      }
      const paymentResult = await this.collabService.processPaymentService(
        paymentMethodId,
        amount,
        requestId,
        mentorRequestData as Partial<IMentorRequest>,
        email,
        returnUrl
      );
      const paymentIntent = 'paymentIntent' in paymentResult ? paymentResult.paymentIntent : paymentResult;
      if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
        this.sendSuccess(res, { charge: paymentIntent }, 'Payment requires action', 200);
      } else if (paymentIntent.status === 'succeeded') {
        this.sendSuccess(res, { charge: paymentIntent, contacts: paymentResult.contacts }, 'Payment succeeded');
      } else {
        this.sendSuccess(res, { charge: paymentIntent }, `Payment status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getCollabDataForUserController = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const collabData = await this.collabService.getCollabDataForUserService(id);
      this.sendSuccess(res, { collabData }, 'Collaboration data retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getCollabDataForMentorController = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { id } = req.params;
      const collabData = await this.collabService.getCollabDataForMentorService(id);
      this.sendSuccess(res, { collabData }, 'Collaboration data retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  deleteCollab = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { collabId } = req.params;
      const { reason } = req.body;
      const response = await this.collabService.removeCollab(collabId, reason);
      this.sendSuccess(res, response, 'Collaboration deleted successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getAllMentorRequests = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const mentorRequests = await this.collabService.getMentorRequestsService({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
      });
      this.sendSuccess(res, mentorRequests, 'Mentor requests retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getAllCollabs = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const collaborations = await this.collabService.getCollabsService({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
      });
      this.sendSuccess(res, collaborations, 'Collaborations retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getCollabDetailsByCollabId = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { collabId } = req.params;
      const collabDetails = await this.collabService.fetchCollabById(collabId);
      this.sendSuccess(res, collabDetails, 'Collaboration details accessed successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getRequestDetailsByRequestId = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { requestId } = req.params;
      const requestDetails = await this.collabService.fetchRequestById(requestId);
      this.sendSuccess(res, requestDetails, 'Request details accessed successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  markUnavailableDays= async(req: Request, res: Response): Promise<void> =>{
    try {
      const { collabId } = req.params;
      const { datesAndReasons, requestedBy, requesterId, approvedById, isApproved } = req.body;
      const updatedCollaboration = await this.collabService.markUnavailableDaysService(collabId, {
        datesAndReasons,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      });
      this.sendSuccess(res, updatedCollaboration, 'Unavailable days updated');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  updateTemporarySlotChanges = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { collabId } = req.params;
      const { datesAndNewSlots, requestedBy, requesterId, approvedById, isApproved } = req.body;
      const updatedCollaboration = await this.collabService.updateTemporarySlotChangesService(collabId, {
        datesAndNewSlots,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      });
      this.sendSuccess(res, updatedCollaboration, 'Temporary slot changes updated');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  approveTimeSlotRequest = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { collabId } = req.params;
      const { requestId, isApproved, requestType } = req.body;
      const updatedCollaboration = await this.collabService.processTimeSlotRequest(
        collabId,
        requestId,
        isApproved,
        requestType
      );
      this.sendSuccess(res, updatedCollaboration, 'Time slot request processed successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  getMentorLockedSlotsController = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      if (!mentorId) {
        this.throwError(400, 'Mentor ID is required');
      }
      const lockedSlots = await this.collabService.getMentorLockedSlots(mentorId);
      this.sendSuccess(res, { lockedSlots }, 'Locked slots retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }
}