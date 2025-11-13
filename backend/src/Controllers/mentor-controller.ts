import type { Request, Response, Express, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "../core/Controller/base-controller";
import { uploadMedia } from "../core/Utils/cloudinary";
import logger from "../core/Utils/Logger";
import { IMentorController } from "../Interfaces/Controller/i-mentor-controller";
import { HttpError } from "../core/Utils/error-handler";
import { StatusCodes } from "../enums/status-code-enums";
import { IMentorService } from "../Interfaces/Services/i-mentor-service";
import { MENTOR_MESSAGES } from "../constants/messages";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class MentorController extends BaseController implements IMentorController{
  private _mentorService: IMentorService;

  constructor(
    @inject('IMentorService') mentorService : IMentorService,
  ) {
    super();
    this._mentorService = mentorService;
  }

  checkMentorStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const mentor = await this._mentorService.getMentorByUserId(id);
      this.sendSuccess(res, { mentor: mentor || null }, MENTOR_MESSAGES.MENTOR_STATUS_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  getMentorDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId } = req.params;
      const mentor = await this._mentorService.getMentorByMentorId(mentorId);
      if (!mentor) {
        // throw new HttpError(ERROR_MESSAGES.MENTOR_NOT_FOUND, StatusCodes.NOT_FOUND);
        this.sendSuccess(res,  mentor, MENTOR_MESSAGES.NO_MENTOR_FOUND);
        return;
      }
      this.sendSuccess(res, { mentor }, MENTOR_MESSAGES.MENTOR_DETAILS_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  createMentor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, specialization, bio, price, skills, availableSlots, timePeriod } = req.body;

      let uploadedCertificates: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map((file) =>
          uploadMedia(file.path, "mentor_certificates", file.size).then((result) => result.url)
        );
        uploadedCertificates = await Promise.all(uploadPromises);
      } else {
        throw new HttpError(ERROR_MESSAGES.CERTIFICATES_REQUIRED, StatusCodes.BAD_REQUEST);
      }

      const newMentor = await this._mentorService.submitMentorRequest({
        userId,
        skills: JSON.parse(skills),
        specialization,
        bio,
        price,
        availableSlots: JSON.parse(availableSlots),
        timePeriod,
        certifications: uploadedCertificates,
      });

      this.sendCreated(res, newMentor, MENTOR_MESSAGES.MENTOR_REGISTRATION_SUBMITTED);
    } catch (error: any) {
      next(error);
    }
  };

  getAllMentorRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", search = "", status = "", sort = "desc" } = req.query;
      const mentorRequests = await this._mentorService.getAllMentorRequests(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        status as string,
        sort as "asc" | "desc"
      );

      if (mentorRequests.mentors.length === 0) {
        this.sendSuccess(res, { mentors: [], total: 0 }, MENTOR_MESSAGES.NO_MENTOR_REQUESTS_FOUND);
        return;
      }
      this.sendSuccess(
        res,
        {
          mentors: mentorRequests.mentors,
          total: mentorRequests.total,
          currentPage: parseInt(page as string),
          totalPages: mentorRequests.pages,
        },
        MENTOR_MESSAGES.MENTOR_REQUESTS_RETRIEVED
      );
    } catch (error: any) {
      next(error);
    }
  };

  getAllMentors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page, limit, skill, category, sortBy, sortOrder, excludeMentorId } = req.query;
      const query: any = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (skill) query.skill = skill as string;
      if (category) query.category = category as string;
      if (sortBy) query.sortBy = sortBy as string;
      if (sortOrder) query.sortOrder = sortOrder as string;
      if (excludeMentorId) query.excludeMentorId = excludeMentorId as string;

      logger.debug(`Fetching mentors with query: ${JSON.stringify(query)}`);
      const result = await this._mentorService.getAllMentors(query);

      if (result.mentors.length === 0) {
        this.sendSuccess(
          res,
          { mentors: [], total: 0, page: query.page || 1, limit: query.limit || 10 },
          MENTOR_MESSAGES.NO_MENTORS_FOUND
        );
        return;
      }

      const data = !search && !page && !limit && !skill
        ? result.mentors
        : {
            mentors: result.mentors,
            total: result.total,
            page: query.page || 1,
            limit: query.limit || 10,
          };

      this.sendSuccess(res, data, MENTOR_MESSAGES.MENTORS_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getAllMentors: ${error.message}`);
      next(error);
    }
  };

  getMentorByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const mentor = await this._mentorService.getMentorByUserId(userId);
      if (!mentor) {
        this.sendSuccess(res,  mentor, MENTOR_MESSAGES.NO_MENTOR_FOUND);
        return;
      }
      this.sendSuccess(res, mentor, MENTOR_MESSAGES.MENTOR_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  approveMentorRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this._mentorService.approveMentorRequest(id);
      this.sendSuccess(res, null, MENTOR_MESSAGES.MENTOR_REQUEST_APPROVED);
    } catch (error: any) {
      next(error);
    }
  };

  rejectMentorRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        throw new HttpError(ERROR_MESSAGES.REJECTION_REASON_REQUIRED, StatusCodes.BAD_REQUEST);
      }
      await this._mentorService.rejectMentorRequest(id, reason);
      this.sendSuccess(res, null, MENTOR_MESSAGES.MENTOR_REQUEST_REJECTED);
    } catch (error: any) {
      next(error);
    }
  };

  cancelMentorship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId } = req.params;
      await this._mentorService.cancelMentorship(mentorId);
      this.sendSuccess(res, null, MENTOR_MESSAGES.MENTORSHIP_CANCELLED);
    } catch (error: any) {
      next(error);
    }
  };

  updateMentorProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId } = req.params;
      const updateData = req.body;
      const mentorData = await this._mentorService.updateMentorById(mentorId, updateData);
      this.sendSuccess(res, mentorData, MENTOR_MESSAGES.MENTOR_PROFILE_UPDATED);
    } catch (error: any) {
      next(error);
    }
  };

  getMentorAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = "1", limit = "10", sortBy = "totalEarnings", sortOrder = "desc", search = "" } = req.query;

      const validSortFields = ["totalEarnings", "platformFees", "totalCollaborations", "avgCollabPrice"] as const;
      type SortByType = (typeof validSortFields)[number];
      const validatedSortBy: SortByType = validSortFields.includes(sortBy as SortByType)
        ? (sortBy as SortByType)
        : "totalEarnings";

      const validSortOrders = ["asc", "desc"] as const;
      type SortOrderType = (typeof validSortOrders)[number];
      const validatedSortOrder: SortOrderType = validSortOrders.includes(sortOrder as SortOrderType)
        ? (sortOrder as SortOrderType)
        : "desc";

      const analytics = await this._mentorService.getMentorAnalytics(
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10,
        validatedSortBy,
        validatedSortOrder,
        search as string
      );
      this.sendSuccess(
        res,
        {
          mentors: analytics.mentors,
          total: analytics.total,
          currentPage: parseInt(page as string) || 1,
          totalPages: analytics.pages,
        },
        MENTOR_MESSAGES.MENTOR_ANALYTICS_RETRIEVED
      );
    } catch (error: any) {
      next(error);
    }
  };

  getSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period = "1month" } = req.query;
      const report = await this._mentorService.getSalesReport(period as string);
      this.sendSuccess(res, report, MENTOR_MESSAGES.SALES_REPORT_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };
}
