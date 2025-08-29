import { Request, Response } from "express";
import { BaseController } from "../../../core/Controller/BaseController";
import { MentorService } from "../Service/Mentorservice";
import { AuthService } from "../../Auth/Service/AuthService";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import { uploadMedia } from "../../../core/Utils/Cloudinary";
import logger from "../../../core/Utils/Logger";

export class MentorController extends BaseController {
  private mentorService: MentorService;
  private authService: AuthService;
  private userRepo: UserRepository;

  constructor() {
    super();
    this.mentorService = new MentorService();
    this.authService = new AuthService();
    this.userRepo = new UserRepository();
  }

  checkMentorStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const mentor = await this.mentorService.getMentorByUserId(id);
      this.sendSuccess(
        res,
        { mentor: mentor || null },
        "Mentor status retrieved successfully"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getMentorDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mentorId } = req.params;
      const mentor = await this.mentorService.getMentorByMentorId(mentorId);
      if (!mentor) {
        this.throwError(404, "Mentor not found");
      }
      this.sendSuccess(
        res,
        { mentor },
        "Mentor details retrieved successfully"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  createMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userId,
        specialization,
        bio,
        price,
        skills,
        availableSlots,
        timePeriod,
      } = req.body;

      const user = await this.userRepo.getUserById(userId);
      if (!user) {
        this.throwError(404, "User not found");
      }

      if (user?.role !== "mentor") {
        await this.authService.changeRole(userId, "mentor");
      }

      const existingMentor = await this.mentorService.getMentorByUserId(userId);
      if (existingMentor) {
        this.throwError(400, "Mentor profile already exists");
      }

      let uploadedCertificates: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map((file) =>
          uploadMedia(file.path, "mentor_certificates", file.size).then(
            (result) => result.url
          )
        );
        uploadedCertificates = await Promise.all(uploadPromises);
      } else {
        this.throwError(
          400,
          "Certificates are required for mentor registration"
        );
      }

      const newMentor = await this.mentorService.submitMentorRequest({
        userId,
        skills: JSON.parse(skills),
        specialization,
        bio,
        price,
        availableSlots: JSON.parse(availableSlots),
        timePeriod,
        certifications: uploadedCertificates,
      });

      this.sendCreated(
        res,
        newMentor,
        "Mentor registration submitted successfully for admin review"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getAllMentorRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "10",
        search = "",
        status = "",
        sort = "desc",
      } = req.query;
      const mentorRequests = await this.mentorService.getAllMentorRequests(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        status as string,
        sort as string
      );

      if (mentorRequests.mentors.length === 0) {
        res.status(200).json({
          success: true,
          message: "Mentor Request Not found",
          data: {
            mentors: [],
            total: 0,
          },
        });
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
        "Mentor requests retrieved successfully"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getAllMentors = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        search,
        page,
        limit,
        skill,
        category,
        sortBy,
        sortOrder,
      } = req.query;
      const query: any = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (skill) query.skill = skill as string;
      if (category) query.category = category as string;
      if (sortBy) query.sortBy = sortBy as string;
      if (sortOrder) query.sortOrder = sortOrder as string;

      logger.debug(`Fetching mentors with query: ${JSON.stringify(query)}`);
      const result = await this.mentorService.getAllMentors(query);

      // If no mentors found, return 200 with empty array and message
      if (result.mentors.length === 0) {
        res.status(200).json({
          success: true,
          message: "No mentors found",
          data: {
            mentors: [],
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
          },
        });
        return;
      }

      // If no query parameters, return all mentors
      if (!search && !page && !limit && !skill) {
        res.status(200).json({
          success: true,
          message: "Mentors fetched successfully",
          data: result.mentors,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Mentors fetched successfully",
          data: {
            mentors: result.mentors,
            total: result.total,
            page: query.page || 1,
            limit: query.limit || 10,
          },
        });
      }
    } catch (error: any) {
      logger.error(`Error in getAllMentors: ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: `Server error: ${error.message}` });
    }
  };

  getMentorByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const mentor = await this.mentorService.getMentorByUserId(userId);
      if (!mentor) {
        this.throwError(404, "Mentor not found");
      }
      this.sendSuccess(res, mentor, "Mentor retrieved successfully");
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  approveMentorRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.mentorService.approveMentorRequest(id);
      this.sendSuccess(
        res,
        null,
        "Mentor request approved successfully. Email sent to user"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  rejectMentorRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        this.throwError(400, "Rejection reason is required");
      }
      await this.mentorService.rejectMentorRequest(id, reason);
      this.sendSuccess(
        res,
        null,
        "Mentor request rejected successfully. Email sent to user"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  cancelMentorship = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mentorId } = req.params;
      await this.mentorService.cancelMentorship(mentorId);
      this.sendSuccess(
        res,
        null,
        "Mentorship cancelled successfully. Email sent to user"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateMentorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mentorId } = req.params;
      const updateData = req.body;
      const mentorData = await this.mentorService.updateMentorById(
        mentorId,
        updateData
      );
      this.sendSuccess(res, mentorData, "Mentor profile updated successfully");
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getMentorAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "10",
        sortBy = "totalEarnings",
        sortOrder = "desc",
      } = req.query;

      const validSortFields = [
        "totalEarnings",
        "platformFees",
        "totalCollaborations",
        "avgCollabPrice",
      ] as const;
      type SortByType = (typeof validSortFields)[number];
      const validatedSortBy: SortByType = validSortFields.includes(
        sortBy as SortByType
      )
        ? (sortBy as SortByType)
        : "totalEarnings";

      const validSortOrders = ["asc", "desc"] as const;
      type SortOrderType = (typeof validSortOrders)[number];
      const validatedSortOrder: SortOrderType = validSortOrders.includes(
        sortOrder as SortOrderType
      )
        ? (sortOrder as SortOrderType)
        : "desc";

      const analytics = await this.mentorService.getMentorAnalytics(
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10,
        validatedSortBy,
        validatedSortOrder
      );
      this.sendSuccess(
        res,
        {
          mentors: analytics.mentors,
          total: analytics.total,
          currentPage: parseInt(page as string) || 1,
          totalPages: analytics.pages,
        },
        "Mentor analytics retrieved successfully"
      );
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getSalesReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = "1month" } = req.query;
      const report = await this.mentorService.getSalesReport(period as string);
      this.sendSuccess(res, report, "Sales report retrieved successfully");
    } catch (error: any) {
      this.handleError(error, res);
    }
  };
}
