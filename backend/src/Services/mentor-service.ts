import { inject, injectable } from "inversify";
import { sendEmail } from "../core/Utils/email";
import logger from "../core/Utils/logger";
import { IMentor } from "../Interfaces/Models/i-mentor";
import {
  CompleteMentorDetails,
  MentorAnalytics,
  MentorQuery,
  SalesReport,
} from "../Utils/Types/mentor-types";
import { ServiceError } from "../core/Utils/error-handler";
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
import { toMentorDTO, toMentorDTOs } from "../Utils/Mappers/mentor-mapper";

@injectable()
export class MentorService implements IMentorService {
  private _mentorRepository: IMentorRepository;
  private _authRepository: IUserRepository;
  private _collabRepository: ICollaborationRepository;
  private _notificationService: INotificationService;
  private _categoryRepository: ICategoryRepository;
  private _skillRepository: ISkillsRepository;

  constructor(
    @inject("IMentorRepository") mentorRepository: IMentorRepository,
    @inject("IUserRepository") userRepository: IUserRepository,
    @inject("ICollaborationRepository")
    collaborationRepository: ICollaborationRepository,
    @inject("INotificationService") notificationService: INotificationService,
    @inject("ICategoryRepository") categoryService: ICategoryRepository,
    @inject("ISkillsRepository") skillRepository: ISkillsRepository
  ) {
    this._mentorRepository = mentorRepository;
    this._authRepository = userRepository;
    this._collabRepository = collaborationRepository;
    this._notificationService = notificationService;
    this._categoryRepository = categoryService;
    this._skillRepository = skillRepository;
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
  }): Promise<IMentorDTO | null> => {
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
        await this._authRepository.updateUserRole(mentorData.userId, "mentor");
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

      const mentor = await this._mentorRepository.saveMentorRequest(mentorData);
      logger.info(
        `Mentor request submitted: ${mentor._id} for user ${mentorData.userId}`
      );

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
            "profile"
          );
          logger.info(
            `Created new_mentor notification for admin ${admin._id}: ${notification.id}`
          );
        }
      }

      return toMentorDTO(mentor);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error submitting mentor request for user ${mentorData.userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to submit mentor request",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
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
        "profile"
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
    try {
      logger.debug(`Cancelling mentorship: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        logger.error("Invalid mentor ID");
        throw new ServiceError(
          "Mentor ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      const mentor = await this._mentorRepository.cancelMentorship(id);
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
        "Mentorship Cancelled",
        `Hello ${user.name},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`
      );
      logger.info(`Cancellation email sent to: ${user.email}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error cancelling mentorship ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to cancel mentorship",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
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
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{
    mentors: MentorAnalytics[];
    total: number;
    page: number;
    pages: number;
  }> => {
    try {
      logger.debug(
        `Fetching mentor analytics with page: ${page}, limit: ${limit}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`
      );

      if (page < 1 || limit < 1) {
        logger.error("Invalid pagination parameters");
        throw new ServiceError(
          "Page and limit must be positive numbers",
          StatusCodes.BAD_REQUEST
        );
      }

      const validSortFields = [
        "totalEarnings",
        "platformFees",
        "totalCollaborations",
        "avgCollabPrice",
      ];
      if (!validSortFields.includes(sortBy)) {
        logger.error(`Invalid sortBy field: ${sortBy}`);
        throw new ServiceError(
          `SortBy must be one of: ${validSortFields.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const validSortOrders = ["asc", "desc"];
      if (!validSortOrders.includes(sortOrder)) {
        logger.error(`Invalid sort order: ${sortOrder}`);
        throw new ServiceError(
          `Sort order must be one of: ${validSortOrders.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      const { mentors, total } = await this._mentorRepository.getAllMentors();
      const analytics: MentorAnalytics[] = await Promise.all(
        mentors.map(async (mentor: CompleteMentorDetails) => {
          const collaborations = await this._collabRepository.findByMentorId(
            mentor.id.toString()
          );
          const totalCollaborations = collaborations.length;
          const totalEarnings = collaborations.reduce(
            (sum, collab) => sum + (collab.price - 100),
            0
          );
          const platformFees = totalCollaborations * 100;
          const avgCollabPrice =
            totalCollaborations > 0 ? totalEarnings / totalCollaborations : 0;

          if (!mentor.userId) {
            logger.warn(`Mentor ${mentor.id} is missing userId`);
            return {
              mentorId: mentor.id.toString(),
              name: "Unknown",
              email: "Unknown",
              specialization: mentor.specialization,
              approvalStatus: mentor.isApproved,
              totalCollaborations,
              totalEarnings,
              platformFees,
              avgCollabPrice,
            };
          }

          const user = await this._authRepository.getUserById(
            mentor.userId._id.toString()
          );
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

      const sortedAnalytics = analytics.sort((a, b) => {
        const multiplier = sortOrder === "asc" ? 1 : -1;
        return multiplier * (a[sortBy] - b[sortBy]);
      });

      const startIndex = (page - 1) * limit;
      const paginatedAnalytics = sortedAnalytics.slice(
        startIndex,
        startIndex + limit
      );

      logger.info(
        `Fetched ${paginatedAnalytics.length} mentor analytics, total: ${total}`
      );
      return {
        mentors: paginatedAnalytics,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor analytics: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor analytics",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
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
}
