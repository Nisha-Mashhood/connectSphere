import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { sendEmail } from "../core/utils/email";
import logger from "../core/utils/logger";
import { IMentor } from "../Interfaces/Models/i-mentor";
import {
  CompleteMentorDetails,
  MentorAnalytics,
  MentorExperienceInput,
  MentorQuery,
  SalesReport,
} from "../Utils/types/mentor-types";
import { ServiceError } from "../core/utils/error-handler";
import { Types } from "mongoose";
import { IMentorService } from "../Interfaces/Services/i-mentor-service";
import { StatusCodes } from "../enums/status-code-enums";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { IMentorDTO } from "../Interfaces/DTOs/i-mentor-dto";
import { toMentorDTO, toMentorDTOs } from "../Utils/mappers/mentor-mapper";
import { IMentorExperienceRepository } from "../Interfaces/Repository/i-mentor-experience-repository";
import { IMentorExperience } from "../Interfaces/Models/i-mentor-experience";
import { IMentorExperienceDTO } from "../Interfaces/DTOs/i-mentor-experience-dto";
import { toMentorExperienceDTO, toMentorExperienceDTOs } from "../Utils/mappers/mentor-experience-mapper";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
import PDFDocument from 'pdfkit';

@injectable()
export class MentorService implements IMentorService {
  private _mentorRepository: IMentorRepository;
  private _authRepository: IUserRepository;
  private _collabRepository: ICollaborationRepository;
  private _notificationService: INotificationService;
  private _categoryRepository: ICategoryRepository;
  private _skillRepository: ISkillsRepository;
  private _mentorExperienceRepository: IMentorExperienceRepository;
  private _collabService: ICollaborationService;

  constructor(
    @inject("IMentorRepository") mentorRepository: IMentorRepository,
    @inject("IUserRepository") userRepository: IUserRepository,
    @inject("ICollaborationRepository") collaborationRepository: ICollaborationRepository,
    @inject("INotificationService") notificationService: INotificationService,
    @inject("ICategoryRepository") categoryService: ICategoryRepository,
    @inject("ISkillsRepository") skillRepository: ISkillsRepository,
    @inject("IMentorExperienceRepository") mentorExperienceRepository: IMentorExperienceRepository,
    @inject('ICollaborationService') collaborationService : ICollaborationService,
  ) {
    this._mentorRepository = mentorRepository;
    this._authRepository = userRepository;
    this._collabRepository = collaborationRepository;
    this._notificationService = notificationService;
    this._categoryRepository = categoryService;
    this._skillRepository = skillRepository;
    this._mentorExperienceRepository = mentorExperienceRepository;
    this._collabService = collaborationService;
  }

  submitMentorRequest = async (mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
    experiences?: MentorExperienceInput[];
  }): Promise<IMentorDTO | null> => {

    const session = await mongoose.startSession();
    session.startTransaction();

    let mentor: IMentor | null = null;
    

    try {
      logger.debug(`Submitting mentor request for user: ${mentorData.userId}`);

      if (
        !mentorData.userId ||
        !mentorData.skills ||
        !mentorData.specialization ||
        !mentorData.bio ||
        !mentorData.availableSlots
      ) {
        logger.error("Missing required fields in mentorData");
        throw new ServiceError(
          "User ID, skills, specialization, bio, available slots, price, and time period are required",
          StatusCodes.BAD_REQUEST
        );
      }

      const existingMentor = await this._mentorRepository.getMentorByUserId(
        mentorData.userId
      );

      if (existingMentor) {
        throw new ServiceError(
          "Mentor profile already exists",
          StatusCodes.BAD_REQUEST
        );
      }

      const user = await this._authRepository.getUserById(mentorData.userId);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      if (user.role !== "mentor") {
        await this._authRepository.updateUserRole(mentorData.userId, "mentor", { session });
      }

      if (mentorData.skills.length === 0) {
        logger.error("At least one skill is required");
        throw new ServiceError(
          "At least one skill is required",
          StatusCodes.BAD_REQUEST
        );
      }

      if (mentorData.availableSlots.length === 0) {
        logger.error("At least one available slot is required");
        throw new ServiceError(
          "At least one available slot is required",
          StatusCodes.BAD_REQUEST
        );
      }

      if (mentorData.price < 0) {
        logger.error("Price cannot be negative");
        throw new ServiceError(
          "Price cannot be negative",
          StatusCodes.BAD_REQUEST
        );
      }

      if (mentorData.timePeriod <= 0) {
        logger.error("Time period must be positive");
        throw new ServiceError(
          "Time period must be positive",
          StatusCodes.BAD_REQUEST
        );
      }

      mentor = await this._mentorRepository.saveMentorRequest(
        {
        userId: mentorData.userId,
        skills: mentorData.skills,
        specialization: mentorData.specialization,
        bio: mentorData.bio,
        price: mentorData.price,
        availableSlots: mentorData.availableSlots,
        timePeriod: mentorData.timePeriod,
        certifications: mentorData.certifications,
      }, { session }
      );
      logger.info(
        `Mentor request submitted: ${mentor._id} for user ${mentorData.userId}`
      );

      if (mentorData.experiences && mentorData.experiences.length > 0) {
      const experiencePromises = mentorData.experiences.map((exp) =>
        this._mentorExperienceRepository.createOne(
          {
            mentorId: mentor?._id,
            role: exp.role,
            organization: exp.organization,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            isCurrent: exp.isCurrent,
            description: exp.description || undefined,
          } as Partial<IMentorExperience>,
          { session }
        )
      );

      const createdExperiences = await Promise.all(experiencePromises);
      logger.info(`Created ${createdExperiences.length} experiences for mentor ${mentor._id}`);
    }

    // Commit transaction
    await session.commitTransaction();
    logger.info("Transaction committed successfully — mentor and experiences saved atomically");

    try {
      const admins = await this._authRepository.getAllAdmins();
      if (!admins || admins.length === 0) {
        logger.warn("No admins found to notify for new mentor request");
      } else {
        for (const admin of admins) {
          const notification = await this._notificationService.sendNotification(
            admin._id.toString(),
            "new_mentor",
            mentorData.userId,
            mentor._id.toString(),
            "user"
          );
          logger.info(`Created new_mentor notification for admin ${admin._id}: ${notification.id}`);
        }
      }
    } catch (notifError) {
      logger.error("Failed to send admin notifications", notifError);
    }

      return toMentorDTO(mentor);
    } catch (error: unknown) {
      await session.abortTransaction();
      logger.error("Transaction aborted — rolling back all changes");

      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error submitting mentor request for user ${mentorData.userId}: ${err.message}`);

      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to submit mentor request", StatusCodes.INTERNAL_SERVER_ERROR, err);
    } finally {
      session.endSession();
    }
  };

  getAllMentorRequests = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "",
    sort: "asc" | "desc" = "desc"
  ): Promise<{
    mentors: IMentorDTO[];
    total: number;
    page: number;
    pages: number;
  }> => {
    try {
      logger.debug(
        `Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}, status: ${status}, sort: ${sort}`
      );

      if (page < 1 || limit < 1) {
        logger.error("Invalid pagination parameters");
        throw new ServiceError(
          "Page and limit must be positive numbers",
          StatusCodes.BAD_REQUEST
        );
      }

      const validSorts = ["asc", "desc"];
      if (!validSorts.includes(sort)) {
        logger.error(`Invalid sort order: ${sort}`);
        throw new ServiceError(
          `Sort must be one of: ${validSorts.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const validStatuses = ["Processing", "Completed", "Rejected", ""];
      if (!validStatuses.includes(status)) {
        logger.error(`Invalid status: ${status}`);
        throw new ServiceError(
          `Status must be one of: ${validStatuses.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const result = await this._mentorRepository.getAllMentorRequests(
        page,
        limit,
        search,
        status,
        sort
      );
      logger.info(
        `Fetched ${result.mentors.length} mentor requests, total: ${result.total}`
      );
      return {
          mentors: toMentorDTOs(result.mentors),
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

  getAllMentors = async (
    query: MentorQuery
  ): Promise<{ mentors: CompleteMentorDetails[]; total: number }> => {
    try {
      logger.debug(
        `Fetching all approved mentors with query: ${JSON.stringify(query)}`
      );

      const modifiedQuery: MentorQuery = { ...query };

      if (query.category && Types.ObjectId.isValid(query.category)) {
        const categoryDoc = await this._categoryRepository.getCategoryById(
          query.category
        );
        if (categoryDoc) {
          modifiedQuery.category = categoryDoc.name;
          logger.info(
            `Mapped category ID: ${query.category} to name: ${categoryDoc.name}`
          );
        } else {
          logger.warn(`Category ID not found: ${query.category}`);
          throw new ServiceError("Category not found", StatusCodes.NOT_FOUND);
        }
      } else if (query.category) {
        logger.info(`Using provided category name: ${query.category}`);
      }

      if (query.skill && Types.ObjectId.isValid(query.skill)) {
        const skillDoc = await this._skillRepository.getSkillById(query.skill);
        if (skillDoc) {
          modifiedQuery.skill = skillDoc.name;
          logger.info(
            `Mapped skill ID: ${query.skill} to name: ${skillDoc.name}`
          );
        } else {
          logger.warn(`Skill ID not found: ${query.skill}`);
          throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
        }
      } else if (query.skill) {
        logger.info(`Using provided skill name: ${query.skill}`);
      }

      const result = await this._mentorRepository.getAllMentors(modifiedQuery);
      logger.info(
        `Fetched ${result.mentors.length} mentors, total: ${result.total}`
      );
      return {
        mentors: result.mentors,
        total: result.total,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentors: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentors",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getMentorByMentorId = async (mentorId: string): Promise<IMentorDTO | null> => {
    try {
      logger.debug(`Fetching mentor by ID: ${mentorId}`);

      if (!Types.ObjectId.isValid(mentorId)) {
        logger.error("Invalid mentor ID");
        throw new ServiceError(
          "Mentor ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.getMentorById(mentorId);
      if (!mentor) {
        logger.warn(`Mentor not found: ${mentorId}`);
        return null;
      }

      logger.info(`Fetched mentor: ${mentorId}`);
      return toMentorDTO(mentor);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor ${mentorId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getMentorExperiences = async (mentorId: string): Promise<IMentorExperienceDTO[]> => {
  try {
    logger.debug(`Fetching experiences for mentor ID: ${mentorId}`);

    if (!Types.ObjectId.isValid(mentorId)) {
      logger.error("Invalid mentor ID format");
      throw new ServiceError("Invalid mentor ID", StatusCodes.BAD_REQUEST);
    }

    const experiences = await this._mentorExperienceRepository.findByMentorId(mentorId);

    if (!experiences || experiences.length === 0) {
      logger.info(`No experiences found for mentor: ${mentorId}`);
      return [];
    }

    logger.info(`Fetched ${experiences.length} experiences for mentor: ${mentorId}`);
    return toMentorExperienceDTOs(experiences);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error fetching experiences for mentor ${mentorId}: ${err.message}`);
    throw error instanceof ServiceError
      ? error
      : new ServiceError("Failed to fetch mentor experiences", StatusCodes.INTERNAL_SERVER_ERROR, err);
  }
};

  approveMentorRequest = async (id: string): Promise<void> => {
    try {
      logger.debug(`Approving mentor request: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        logger.error("Invalid mentor request ID");
        throw new ServiceError(
          "Mentor request ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.approveMentorRequest(id);
      if (!mentor) {
        logger.error(`Mentor not found: ${id}`);
        throw new ServiceError("Mentor not found", StatusCodes.NOT_FOUND);
      }

      const user = await this._authRepository.getUserById(
        mentor.userId.toString()
      );
      if (!user) {
        logger.error(`User not found for mentor userId: ${mentor.userId}`);
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      await sendEmail(
        user.email,
        "Mentor Request Approved",
        `Hello ${user.name},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\nAdmin\nConnectSphere`
      );
      logger.info(`Approval email sent to: ${user.email}`);

      const notification = await this._notificationService.sendNotification(
        user._id.toString(),
        "mentor_approved",
        user._id.toString(),
        user._id.toString(),
        "user"
      );
      logger.info(
        `Created mentor_approved notification for user ${user._id}: ${notification.id}`
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error approving mentor request ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to approve mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  rejectMentorRequest = async (id: string, reason: string): Promise<void> => {
    try {
      logger.debug(`Rejecting mentor request: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        logger.error("Invalid mentor request ID");
        throw new ServiceError(
          "Mentor request ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!reason || reason.trim() === "") {
        logger.error("Reason is required for rejection");
        throw new ServiceError(
          "Reason is required for rejecting mentor request",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.rejectMentorRequest(id);
      if (!mentor) {
        logger.error(`Mentor not found: ${id}`);
        throw new ServiceError("Mentor not found", StatusCodes.NOT_FOUND);
      }

      const user = await this._authRepository.getUserById(
        mentor.userId.toString()
      );
      if (!user) {
        logger.error(`User not found for mentor userId: ${mentor.userId}`);
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      await sendEmail(
        user.email,
        "Mentor Request Rejected",
        `Hello ${user.name},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin\nConnectSphere`
      );
      logger.info(`Rejection email sent to: ${user.email}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error rejecting mentor request ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to reject mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  cancelMentorship = async (id: string): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      logger.debug(`Cancelling mentorship for mentor ID: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        throw new ServiceError(
          "Mentor ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      // First, cancel the mentor profile
      const mentor = await this._mentorRepository.cancelMentorship(id, { session });
      if (!mentor) {
        throw new ServiceError("Mentor not found", StatusCodes.NOT_FOUND);
      }

      const user = await this._authRepository.getUserById(mentor.userId.toString());
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      // Send email to mentor about account cancellation
      await sendEmail(
        user.email,
        "Mentorship Cancelled by Admin",
        `Hello ${user.name},\n\nWe regret to inform you that your mentorship privileges have been revoked by the administrator.\n\nAll your ongoing collaborations have been cancelled and users have been refunded where applicable.\n\nIf you believe this is a mistake, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`
      );
      logger.info(`Mentorship cancellation email sent to: ${user.email}`);

      //active collaborations
      const activeCollabs = await this._collabService.getCollabDataForMentorService( id, false );

      if (activeCollabs.length > 0) {
        logger.info(`Found ${activeCollabs.length} active collaborations for mentor ${id}. Processing cancellations...`);

        const cancelReason = "Admin has cancelled the mentor's mentorship account.";
        const refundPercentage = 0.5;

        for (const collab of activeCollabs) {
          try {
            const refundAmount = collab.price * refundPercentage;

            await this._collabService.cancelAndRefundCollab( collab.id, cancelReason, refundAmount );

            logger.info(`Successfully cancelled and refunded collaboration ${collab.id} (refund: ₹${refundAmount})`);
          } catch (cancelError: any) {
            logger.error(
              `Failed to cancel collaboration ${collab.id} during mentor cancellation: ${cancelError.message}`
            );
          }
        }
      } else {
        logger.info(`No active collaborations found for mentor ${id}`);
      }

      await session.commitTransaction();
      logger.info(`Mentorship successfully cancelled for mentor ${id} with all active collaborations processed`);
    } catch (error: unknown) {
      await session.abortTransaction();
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error cancelling mentorship ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to cancel mentorship",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    } finally {
      session.endSession();
    }
  };

  getMentorByUserId = async (userId: string): Promise<IMentorDTO | null> => {
    try {
      logger.debug(`Fetching mentor by user ID: ${userId}`);

      if (!Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID");
        throw new ServiceError(
          "User ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.getMentorByUserId(userId);
      if (!mentor) {
        logger.warn(`Mentor not found for user: ${userId}`);
        return null;
      }

      logger.info(`Fetched mentor for user: ${userId}`);
      return toMentorDTO(mentor);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  updateMentorById = async (
    mentorId: string,
    updateData: Partial<IMentor>
  ): Promise<IMentorDTO | null> => {
    try {
      logger.debug(`Updating mentor: ${mentorId}`);

      if (!Types.ObjectId.isValid(mentorId)) {
        logger.error("Invalid mentor ID");
        throw new ServiceError(
          "Mentor ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.getMentorById(mentorId);
      if (!mentor) {
        logger.error(`Mentor not found: ${mentorId}`);
        throw new ServiceError("Mentor not found", StatusCodes.NOT_FOUND);
      }

      const updatedMentor = await this._mentorRepository.updateMentorById(
        mentorId,
        updateData
      );
      if (!updatedMentor) {
        logger.error(`Failed to update mentor: ${mentorId}`);
        throw new ServiceError(
          "Failed to update mentor",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      logger.info(`Mentor updated: ${mentorId}`);
      return toMentorDTO(updatedMentor);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating mentor ${mentorId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update mentor",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getMentorAnalytics = async (
  page: number = 1,
  limit: number = 10,
  sortBy:
    | "totalEarnings"
    | "platformFees"
    | "totalCollaborations"
    | "avgCollabPrice" = "totalEarnings",
  sortOrder: "asc" | "desc" = "desc",
  search: string = ""
): Promise<{
  mentors: MentorAnalytics[];
  total: number;
  page: number;
  pages: number;
}> => {
  try {
    logger.debug(
      `Fetching mentor analytics with page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}, search=${search}`
    );

    const { mentors } = await this._mentorRepository.getAllMentors();

    const analytics: MentorAnalytics[] = await Promise.all(
      mentors.map(async (mentor: CompleteMentorDetails) => {
        const collaborations = await this._collabRepository.findByMentorId(
          mentor.id.toString()
        );

        const totalCollaborations = collaborations.length;
        const totalEarnings = collaborations.reduce(
          (sum, c) => sum + (c.price - 100),
          0
        );

        const platformFees = totalCollaborations * 100;
        const avgCollabPrice =
          totalCollaborations > 0 ? totalEarnings / totalCollaborations : 0;

        const user = mentor.userId
          ? await this._authRepository.getUserById(mentor.userId._id.toString())
          : null;

        return {
          mentorId: mentor.id.toString(),
          name: user?.name || "Unknown",
          email: user?.email || "Unknown",
          specialization: mentor.specialization,
          approvalStatus: mentor.isApproved,
          totalCollaborations,
          totalEarnings,
          platformFees,
          avgCollabPrice,
        };
      })
    );

    const searchLower = search.toLowerCase();
    const filteredAnalytics = analytics.filter((mentor) =>
      mentor.name.toLowerCase().includes(searchLower) ||
      mentor.email.toLowerCase().includes(searchLower) ||
      (mentor.specialization?.toLowerCase() || "").includes(searchLower)
    );

    const sortedAnalytics = filteredAnalytics.sort((a, b) => {
      const mul = sortOrder === "asc" ? 1 : -1;
      return mul * (a[sortBy] - b[sortBy]);
    });

    const total = sortedAnalytics.length;
    const startIndex = (page - 1) * limit;
    const paginatedAnalytics = sortedAnalytics.slice(
      startIndex,
      startIndex + limit
    );

    return {
      mentors: paginatedAnalytics,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    logger.error("Error fetching mentor analytics:", error);
    throw new ServiceError(
      "Failed to fetch mentor analytics",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};


  getSalesReport = async (period: string): Promise<SalesReport> => {
    try {
      logger.debug(`Fetching sales report for period: ${period}`);

      const validPeriods = ["1month", "1year", "5years"];
      if (!validPeriods.includes(period)) {
        logger.error(`Invalid period: ${period}`);
        throw new ServiceError(
          `Period must be one of: ${validPeriods.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const periods: { [key: string]: number } = {
        "1month": 30 * 24 * 60 * 60 * 1000,
        "1year": 365 * 24 * 60 * 60 * 1000,
        "5years": 5 * 365 * 24 * 60 * 60 * 1000,
      };
      const timeFilter = periods[period];
      const startDate = new Date(Date.now() - timeFilter);

      const collaborations = await this._collabRepository.findByDateRange(
        startDate,
        new Date()
      );
      const totalRevenue = collaborations.reduce(
        (sum, collab) => sum + (collab.price || 0),
        0
      );
      const platformRevenue = collaborations.length * 100;
      const mentorRevenue = totalRevenue - platformRevenue;

      const mentorIds = [
        ...new Set(
          collaborations
            .map((c) => {
              if (
                typeof c.mentorId === "object" &&
                c.mentorId !== null &&
                "_id" in c.mentorId
              ) {
                return c.mentorId._id.toString();
              } else if (
                typeof c.mentorId === "string" &&
                Types.ObjectId.isValid(c.mentorId)
              ) {
                return c.mentorId;
              }
              logger.warn(
                `Invalid mentorId format in collaboration: ${JSON.stringify(
                  c.mentorId
                )}`
              );
              return null;
            })
            .filter((id): id is string => id !== null)
        ),
      ];

      const mentorBreakdown = await Promise.all(
        mentorIds.map(async (mentorId) => {
          try {
            const mentor = await this._mentorRepository.getMentorById(mentorId);
            const mentorCollabs = collaborations.filter(
              (c) =>
                (typeof c.mentorId === "string" && c.mentorId === mentorId) ||
                (typeof c.mentorId === "object" &&
                  c.mentorId !== null &&
                  c.mentorId._id.toString() === mentorId)
            );

            const user = mentor
              ? await this._authRepository.getUserById(
                  mentor.userId?._id.toString()
                )
              : null;

            return {
              mentorId,
              name: user?.name || "Unknown",
              email: user?.email || "Unknown",
              collaborations: mentorCollabs.length,
              mentorEarnings: mentorCollabs.reduce(
                (sum, c) => sum + (c.price - 100),
                0
              ),
              platformFees: mentorCollabs.length * 100,
            };
          } catch (error: unknown) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            logger.error(
              `Error processing mentorId ${mentorId}: ${err.message}`
            );
            return {
              mentorId,
              name: "Unknown",
              email: "Unknown",
              collaborations: 0,
              mentorEarnings: 0,
              platformFees: 0,
            };
          }
        })
      );

      logger.info(
        `Fetched sales report for period ${period}: totalRevenue=${totalRevenue}, platformRevenue=${platformRevenue}`
      );
      return {
        period,
        totalRevenue,
        platformRevenue,
        mentorRevenue,
        mentorBreakdown,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching sales report for period ${period}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch sales report",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };


  public generateSalesReportPDF = async (period: string = "1month"): Promise<Buffer> => {
  try {
    const reportData: SalesReport = await this.getSalesReport(period);

    const periodLabel = 
      period === "1month" ? "Last 30 Days" :
      period === "1year" ? "Last 1 Year" :
      "Last 5 Years";

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc.fontSize(28).text("ConnectSphere Sales Report", { align: "center" });
      doc.fontSize(18).text(`Period: ${periodLabel}`, { align: "center" });
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(3);

      // Revenue Summary Section
      doc.fontSize(20).text("Revenue Summary", { underline: true });
      doc.moveDown(1);

      const summary = [
        { label: "Total Revenue (paid by students)", value: `₹${reportData.totalRevenue.toFixed(2)}` },
        { label: "Platform Fee (₹100 per collaboration)", value: `₹${reportData.platformRevenue.toFixed(2)}` },
        { label: "Mentor Earnings (after platform fee)", value: `₹${reportData.mentorRevenue.toFixed(2)}` },
        { label: "Total Collaborations Completed", value: reportData.mentorBreakdown.reduce((sum, m) => sum + m.collaborations, 0).toString() },
      ];

      summary.forEach(item => {
        doc.fontSize(14).text(item.label, { continued: true, align: "left" });
        doc.text(item.value, { align: "right" });
        doc.moveDown(0.5);
      });

      doc.moveDown(3);

      // Explanation for New Admins
      doc.fontSize(16).text("Understanding the Report", { underline: true });
      doc.moveDown(1);
      doc.fontSize(11).list([
        "Total Revenue: Full amount students paid for mentorship sessions.",
        "Platform Fee: ₹100 deducted from each completed collaboration as service fee.",
        "Mentor Earnings: Amount transferred to mentors (session price - ₹100).",
        "Sessions: Number of successfully completed mentorship programs.",
      ], { bulletRadius: 3, textIndent: 20 });
      doc.moveDown(3);

      // Mentor Breakdown Table
      if (reportData.mentorBreakdown.length === 0) {
        doc.fontSize(14).text("No mentor earnings in this period.", { align: "center" });
      } else {
        doc.fontSize(20).text("Mentor Earnings Breakdown", { underline: true });
        doc.moveDown(1);

        // Table headers
        const tableTop = doc.y;
        const xPositions = [50, 130, 250, 350, 450];
        const headers = ["Mentor Name", "Email", "Sessions", "Mentor Earnings", "Platform Fee"];

        doc.font("Helvetica-Bold");
        headers.forEach((header, i) => {
          doc.fontSize(11).text(header, xPositions[i], tableTop);
        });
        doc.moveDown(1);

        // Rows
        doc.font("Helvetica");
        reportData.mentorBreakdown.forEach((mentor) => {
          const y = doc.y;
          doc.fontSize(10)
             .text((mentor.name || "Unknown").substring(0, 20), xPositions[0], y)
             .text((mentor.email || "Unknown").substring(0, 25), xPositions[1], y)
             .text(`${mentor.collaborations.toString()}`, xPositions[2], y)
             .text(`₹${mentor.mentorEarnings.toFixed(2)}`, xPositions[3], y)
             .text(`₹${mentor.platformFees.toFixed(2)}`, xPositions[4], y);
          doc.moveDown(0.8);
        });
      }

      // Footer
      doc.moveDown(5);
      doc.fontSize(10).text("This report is confidential and intended for administrative use only.", { align: "center" });

      doc.end();
    });
  } catch (error) {
    logger.error("Error in generateSalesReportPDF:", error);
    throw new ServiceError("Failed to generate sales report PDF", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

  addMentorExperience = async (userId: string, data: Partial<IMentorExperience>): Promise<IMentorExperienceDTO> => {
    try {
      const mentor = await this._mentorRepository.getMentorByUserId(userId);
      if (!mentor) throw new ServiceError("Mentor profile not found", StatusCodes.NOT_FOUND);
      if (mentor.isApproved !== "Completed") {
        throw new ServiceError("Only approved mentors can add experiences", StatusCodes.FORBIDDEN);
      }

      const experience = await this._mentorExperienceRepository.createOne({
        mentorId: mentor._id,
        role: data.role!,
        organization: data.organization!,
        startDate: new Date(data.startDate!),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isCurrent: data.isCurrent || false,
        description: data.description,
      });

      return toMentorExperienceDTO(experience)!;
    } catch (error: unknown) {
      throw error instanceof ServiceError ? error : new ServiceError("Failed to add experience", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  updateMentorExperience = async (userId: string, experienceId: string, data: Partial<IMentorExperience>): Promise<IMentorExperienceDTO> => {
    try {
      const mentor = await this._mentorRepository.getMentorByUserId(userId);
      if (!mentor) throw new ServiceError("Mentor profile not found", StatusCodes.NOT_FOUND);
      if (mentor.isApproved !== "Completed") throw new ServiceError("Only approved mentors can update experiences", StatusCodes.FORBIDDEN);

      const existing = await this._mentorExperienceRepository.findById(experienceId);
      if (!existing) throw new ServiceError("Experience not found", StatusCodes.NOT_FOUND);
      if (existing.mentorId.toString() !== mentor._id.toString()) {
        throw new ServiceError("Unauthorized: Cannot edit another mentor's experience", StatusCodes.FORBIDDEN);
      }

      const updated = await this._mentorExperienceRepository.update(experienceId, {
        role: data.role,
        organization: data.organization,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.isCurrent ? undefined : data.endDate ? new Date(data.endDate) : undefined,
        isCurrent: data.isCurrent,
        description: data.description,
      });

      if (!updated) throw new ServiceError("Failed to update experience", StatusCodes.INTERNAL_SERVER_ERROR);

      return toMentorExperienceDTO(updated)!;
    } catch (error: unknown) {
      throw error instanceof ServiceError ? error : new ServiceError("Failed to update experience", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  deleteMentorExperience = async (userId: string, experienceId: string): Promise<void> => {
    try {
      const mentor = await this._mentorRepository.getMentorByUserId(userId);
      if (!mentor) throw new ServiceError("Mentor profile not found", StatusCodes.NOT_FOUND);
      if (mentor.isApproved !== "Completed") throw new ServiceError("Only approved mentors can delete experiences", StatusCodes.FORBIDDEN);

      const existing = await this._mentorExperienceRepository.findById(experienceId);
      if (!existing) throw new ServiceError("Experience not found", StatusCodes.NOT_FOUND);
      if (existing.mentorId.toString() !== mentor._id.toString()) {
        throw new ServiceError("Unauthorized: Cannot delete another mentor's experience", StatusCodes.FORBIDDEN);
      }

      const deleted = await this._mentorExperienceRepository.delete(experienceId);
      if (!deleted) throw new ServiceError("Failed to delete experience", StatusCodes.INTERNAL_SERVER_ERROR);
    } catch (error: unknown) {
      throw error instanceof ServiceError ? error : new ServiceError("Failed to delete experience", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

}
