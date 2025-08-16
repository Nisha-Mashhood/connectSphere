import { BaseService } from "../../../core/Services/BaseService";
import { MentorRepository } from "../Repositry/MentorRepositry";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import { CollaborationRepository } from "../../Collaboration/Repositry/CollaborationRepositry";
import { sendEmail } from "../../../core/Utils/Email";
import logger from "../../../core/Utils/Logger";
import { IMentor } from "../../../Interfaces/models/IMentor";
import { UserInterface } from "../../../Interfaces/models/IUser";
import { MentorAnalytics, MentorQuery, SalesReport } from "../Types/Types";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import { NotificationService } from "../../../Modules/Notification/Service/NotificationService";

export class MentorService extends BaseService {
  private mentorRepo: MentorRepository;
  private authRepo: UserRepository;
  private collabRepo: CollaborationRepository;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.mentorRepo = new MentorRepository();
    this.authRepo = new UserRepository();
    this.collabRepo = new CollaborationRepository();
    this.notificationService = new NotificationService();
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
  }): Promise<IMentor> => {
    logger.debug(`Submitting mentor request for user: ${mentorData.userId}`);
    this.checkData(mentorData);
    const mentor = await this.mentorRepo.saveMentorRequest(mentorData);

    const admins = await this.authRepo.getAllAdmins();

    if (!admins) {
      this.throwError("no admin Found");
    }
    if (admins.length === 0) {
      logger.info("No admins found to notify for new user registration");
    } else {
      // Create notification for each admin
      for (const admin of admins) {
        const notification = await this.notificationService.sendNotification(
          admin._id.toString(),
          "new_mentor",
          mentorData.userId, // senderId is the user submitting the request
          mentor._id.toString(), // relatedId is the mentor request ID
          "profile"
        );
        logger.info(
          `Created new_mentor notification for admin ${admin._id}: ${notification._id}`
        );
      }
    }
    return mentor;
  };

  getAllMentorRequests = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "",
    sort: string = "desc"
  ): Promise<{
    mentors: IMentor[];
    total: number;
    page: number;
    pages: number;
  }> => {
    logger.debug(`Fetching mentor requests`);
    return await this.mentorRepo.getAllMentorRequests(
      page,
      limit,
      search,
      status,
      sort
    );
  };

  getAllMentors = async (
    query: MentorQuery
  ): Promise<{ mentors: IMentor[]; total: number }> => {
    try {
      logger.debug(
        `Fetching all approved mentors with query: ${JSON.stringify(query)}`
      );
      return await this.mentorRepo.getAllMentors(query);
    } catch (error) {
      logger.error(`Error fetching mentors: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to fetch mentors");
    }
  };

  getMentorByMentorId = async (mentorId: string): Promise<IMentor | null> => {
    logger.debug(`Fetching mentor by ID: ${mentorId}`);
    this.checkData(mentorId);
    return await this.mentorRepo.getMentorDetails(mentorId);
  };

  approveMentorRequest = async (id: string): Promise<void> => {
    logger.debug(`Approving mentor request: ${id}`);
    this.checkData(id);
    const mentor: IMentor = await this.mentorRepo.approveMentorRequest(id);
    if (!mentor) {
      this.throwError("Mentor not found");
    }
    const user: UserInterface = await this.authRepo.getUserById(
      mentor?.userId.toString()
    );
    if (!user) {
      this.throwError("User not found");
    }
    await sendEmail(
      user?.email,
      "Mentor Request Approved",
      `Hello ${user?.name},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\n Admin \n ConnectSphere`
    );

    const notification = await this.notificationService.sendNotification(
      user._id.toString(),
      "mentor_approved",
      user._id.toString(), 
      user._id.toString(),
      "profile"
    );
    logger.info(
      `Created mentor_approved notification for user ${user._id}: ${notification._id}`
    );
  };

  rejectMentorRequest = async (id: string, reason: string): Promise<void> => {
    logger.debug(`Rejecting mentor request: ${id}`);
    this.checkData({ id, reason });
    const mentor: IMentor | null = await this.mentorRepo.rejectMentorRequest(
      id
    );
    if (!mentor) {
      this.throwError("Mentor not found");
    }
    const user: UserInterface | null = await this.authRepo.getUserById(
      mentor?.userId.toString()
    );
    if (!user) {
      this.throwError("User not found");
    }
    await sendEmail(
      user?.email,
      "Mentor Request Rejected",
      `Hello ${user?.name},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin\nConnectSphere`
    );
  };

  cancelMentorship = async (id: string): Promise<void> => {
    logger.debug(`Cancelling mentorship: ${id}`);
    this.checkData(id);
    const mentor: IMentor | null = await this.mentorRepo.cancelMentorship(id);
    if (!mentor) {
      this.throwError("Mentor not found");
    }
    const user: UserInterface | null = await this.authRepo.getUserById(
      mentor?.userId.toString()
    );
    if (!user) {
      this.throwError("User not found");
    }
    await sendEmail(
      user?.email,
      "Mentorship Cancelled",
      `Hello ${user?.name},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`
    );
  };

  getMentorByUserId = async (userId: string): Promise<IMentor | null> => {
    logger.debug(`Fetching mentor by user ID: ${userId}`);
    this.checkData(userId);
    return await this.mentorRepo.getMentorByUserId(userId);
  };

  updateMentorById = async (
    mentorId: string,
    updateData: Partial<IMentor>
  ): Promise<IMentor | null> => {
    logger.debug(`Updating mentor: ${mentorId}`);
    this.checkData({ mentorId, updateData });
    const mentor = await this.mentorRepo.getMentorById(mentorId);
    if (!mentor) {
      this.throwError("Mentor not found");
    }
    return await this.mentorRepo.updateMentorById(mentorId, updateData);
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
    logger.debug(
      `Fetching mentor analytics with page: ${page}, limit: ${limit}, sortBy: ${sortBy}`
    );
    const { mentors }: { mentors: IMentor[]; total: number } =
      await this.mentorRepo.getAllMentors();
    logger.info("MEntors: ", mentors);
    const analytics: MentorAnalytics[] = await Promise.all(
      mentors.map(async (mentor: IMentor) => {
        const collaborations = await this.collabRepo.findByMentorId(
          mentor._id.toString()
        );
        const totalCollaborations = collaborations.length;
        const totalEarnings = collaborations.reduce(
          (sum, collab) => sum + (collab.price - 100),
          0
        );
        const platformFees = totalCollaborations * 100;
        const avgCollabPrice =
          totalCollaborations > 0 ? totalEarnings / totalCollaborations : 0;

        logger.info("mentor.userId:", mentor.userId._id);

        if (!mentor.userId) {
          logger.warn(`Mentor ${mentor._id} is missing userId`);
        }
        // Fetch user details
        const user = await this.authRepo.getUserById(
          mentor.userId._id.toString()
        );
        if (!user) {
          logger.warn(`User not found for mentor ID: ${mentor._id}`);
        }

        return {
          mentorId: mentor._id.toString(),
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

    const validSortFields: (
      | "totalEarnings"
      | "platformFees"
      | "totalCollaborations"
      | "avgCollabPrice"
    )[] = [
      "totalEarnings",
      "platformFees",
      "totalCollaborations",
      "avgCollabPrice",
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "totalEarnings";
    const sortedAnalytics = analytics.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      return multiplier * (a[sortField] - b[sortField]);
    });

    const total = analytics.length;
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
  };

  getSalesReport = async (period: string): Promise<SalesReport> => {
    logger.debug(`Fetching sales report for period: ${period}`);
    const periods: { [key: string]: number } = {
      "1month": 30 * 24 * 60 * 60 * 1000,
      "1year": 365 * 24 * 60 * 60 * 1000,
      "5years": 5 * 365 * 24 * 60 * 60 * 1000,
    };
    const timeFilter = periods[period] || periods["1month"];
    const startDate = new Date(Date.now() - timeFilter);

    const collaborations = await this.collabRepo.findByDateRange(
      startDate,
      new Date()
    );
    logger.info("Collaborations:", collaborations);

    const totalRevenue = collaborations.reduce(
      (sum, collab) => sum + (collab.price || 0),
      0
    );
    const platformRevenue = collaborations.length * 100;
    const mentorRevenue = totalRevenue - platformRevenue;

    // Extract unique mentor IDs and ensure they are valid strings
    const mentorIds = [
      ...new Set(
        collaborations
          .map((c) => {
            // Handle cases where mentorId is an object or string
            if (
              typeof c.mentorId === "object" &&
              c.mentorId !== null &&
              "_id" in c.mentorId
            ) {
              return c.mentorId._id.toString();
            } else if (typeof c.mentorId === "string") {
              return c.mentorId;
            } else {
              logger.warn(
                `Invalid mentorId format in collaboration: ${JSON.stringify(
                  c.mentorId
                )}`
              );
              return null;
            }
          })
          .filter((id): id is string => id !== null) // Filter out invalid IDs
      ),
    ];

    const mentorBreakdown = await Promise.all(
      mentorIds.map(async (mentorId) => {
        try {
          // Validate mentorId format (24-character hex string)
          if (!/^[0-9a-fA-F]{24}$/.test(mentorId)) {
            logger.warn(`Skipping invalid mentorId: ${mentorId}`);
            return {
              mentorId,
              name: "Unknown",
              email: "Unknown",
              collaborations: 0,
              mentorEarnings: 0,
              platformFees: 0,
            };
          }

          const mentor = await this.mentorRepo.getMentorById(mentorId);
          const mentorCollabs = collaborations.filter(
            (c) =>
              (typeof c.mentorId === "string" && c.mentorId === mentorId) ||
              (typeof c.mentorId === "object" &&
                c.mentorId !== null &&
                c.mentorId._id.toString() === mentorId)
          );

          const user = await this.authRepo.getUserById(
            mentor?.userId?._id.toString()
          );

          return {
            mentorId,
            name: user?.name,
            email: user?.email,
            collaborations: mentorCollabs.length,
            mentorEarnings: mentorCollabs.reduce(
              (sum, c) => sum + (c.price - 100),
              0
            ),
            platformFees: mentorCollabs.length * 100,
          };
        } catch (error: any) {
          logger.error(
            `Error processing mentorId ${mentorId}: ${error.message}`
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

    return {
      period,
      totalRevenue,
      platformRevenue,
      mentorRevenue,
      mentorBreakdown,
    };
  };
}
