import { inject, injectable } from "inversify";
import mentorModel from "../Models/mentor-model";
import collaboration from "../Models/collaboration-model";
import User from "../Models/user-model";
import MentorRequest from "../Models/mentor-requset-model";
import { IAdminRepository } from "../Interfaces/Repository/i-admin-repositry";
import logger from "../core/utils/logger";
import { RepositoryError } from "../core/utils/error-handler";
import {
  RevenueStats,
  RevenueTrend,
  TopMentor,
  UserGrowth,
} from "../Utils/types/admin-types";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { ICollaboration } from "../Interfaces/Models/i-collaboration";
import { StatusCodes } from "../enums/status-code-enums";
import { IFeedbackRepository } from "../Interfaces/Repository/i-feedback-repositry";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class AdminRepository implements IAdminRepository {
  private _feedbackRepository: IFeedbackRepository;

  constructor(@inject('IFeedbackRepository') feedbackRepository: IFeedbackRepository) {
    this._feedbackRepository = feedbackRepository;
  }

  public getTotalUsersCount = async(): Promise<number> => {
    try {
      return await User.countDocuments({ role: "user" });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalUsersCount", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_USERS_COUNT,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getTotalMentorsCount = async(): Promise<number> => {
    try {
      return await User.countDocuments({ role: "mentor" });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalMentorsCount", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_MENTORS_COUNT,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getTotalRevenue = async(): Promise<RevenueStats> => {
    try {
      const result = await collaboration.aggregate([
        { $match: { payment: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" },
          },
        },
      ]);

      const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
      const platformProfit = totalRevenue * 0.1;

      return { totalRevenue, platformProfit };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalRevenue", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_REVENUE,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getPendingMentorRequestsCount = async(): Promise<number> => {
    try {
      return await MentorRequest.countDocuments({ isAccepted: "Pending" });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getPendingMentorRequestsCount", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_PENDING_MENTOR_REQUESTS_COUNT,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getActiveCollaborationsCount = async(): Promise<number> => {
    try {
      return await collaboration.countDocuments({ isCancelled: false });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getActiveCollaborationsCount", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_ACTIVE_COLLABORATIONS_COUNT,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getRevenueTrends = async(
    timeFormat: string,
    days: number
  ): Promise<RevenueTrend[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await collaboration.aggregate([
        { $match: { createdAt: { $gte: startDate }, payment: true } },
        {
          $group: {
            _id: { $dateToString: { format: timeFormat, date: "$createdAt" } },
            totalRevenue: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return result.map((item) => ({
        name: item._id,
        totalRevenue: item.totalRevenue,
        platformRevenue: Math.round(item.totalRevenue * 0.1),
        mentorRevenue: Math.round(item.totalRevenue * 0.9),
      }));
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getRevenueTrends", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_ACTIVE_COLLABORATIONS_COUNT,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getUserGrowth = async(timeFormat: string, days: number): Promise<UserGrowth[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: timeFormat, date: "$createdAt" },
              },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const groupedByDate: Record<string, UserGrowth> = {};
      userGrowth.forEach((item) => {
        if (!groupedByDate[item._id.date]) {
          groupedByDate[item._id.date] = {
            name: item._id.date,
            users: 0,
            mentors: 0,
          };
        }
        if (item._id.role === "user")
          groupedByDate[item._id.date].users = item.count;
        if (item._id.role === "mentor")
          groupedByDate[item._id.date].mentors = item.count;
      });

      return Object.values(groupedByDate);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getUserGrowth", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_USER_GROWTH,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getPendingMentorRequests = async(limit?: number): Promise<IMentor[]> => {
    try {
      const query = mentorModel
        .find({ isApproved: "Processing" })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      if (limit) query.limit(limit);

      return await query.exec();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getPendingMentorRequests", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_PENDING_MENTOR_REQUESTS,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getTopMentors = async(limit: number): Promise<TopMentor[]> => {
    try {
      const topMentors = await collaboration.aggregate([
        { $match: { payment: true, isCancelled: false } },
        {
          $group: {
            _id: "$mentorId",
            totalEarnings: { $sum: "$price" },
            collaborationCount: { $sum: 1 },
          },
        },
        { $sort: { totalEarnings: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "mentors",
            localField: "_id",
            foreignField: "_id",
            as: "mentorInfo",
          },
        },
        { $unwind: "$mentorInfo" },
        {
          $lookup: {
            from: "users",
            localField: "mentorInfo.userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: "$mentorInfo._id",
            name: "$userInfo.name",
            email: "$userInfo.email",
            userId: "$userInfo._id",
            profilePic: "$userInfo.profilePic",
            totalEarnings: 1,
            collaborationCount: 1,
          },
        },
      ]);

      const mentorsWithRatings = await Promise.all(
        topMentors.map(async (mentor) => {
          const avgRating = await this._feedbackRepository.getMentorAverageRating(
            mentor._id.toString()
          );
          return {
            ...mentor,
            rating:
              avgRating > 0 ? Number(avgRating.toFixed(2)) : "No feedback",
          };
        })
      );

      return mentorsWithRatings;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTopMentors", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_TOP_MENTORS,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getRecentCollaborations = async(limit: number): Promise<ICollaboration[]> => {
    try {
      return await collaboration
        .find({ isCancelled: false })
        .populate({ path: "userId", select: "name profilePic" })
        .populate({
          path: "mentorId",
          populate: { path: "userId", select: "name profilePic" },
        })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getRecentCollaborations", err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_RECENT_COLLABORATIONS,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}

