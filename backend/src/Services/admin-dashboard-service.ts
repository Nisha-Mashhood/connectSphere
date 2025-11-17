import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { ServiceError } from "../core/utils/error-handler";
import { StatusCodes } from "../enums/status-code-enums";
import { IAdminService } from "../Interfaces/Services/i-admin-service";
import {
  RevenueStats,
  RevenueTrend,
  TopMentor,
  UserGrowth,
} from "../Utils/types/admin-types";
import { IAdminRepository } from "../Interfaces/Repository/i-admin-repositry";
import { toMentorDTOs } from "../Utils/mappers/mentor-mapper";
import { IMentorDTO } from "../Interfaces/DTOs/i-mentor-dto";
import { toCollaborationDTOs } from "../Utils/mappers/collaboration-mapper";
import { ICollaborationDTO } from "../Interfaces/DTOs/i-collaboration-dto";
import { ProfileUpdateData } from "../Utils/types/auth-types";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IUserAdminDTO } from "../Interfaces/DTOs/i-user-dto";
import { toUserAdminDTO } from "../Utils/mappers/user-mapper";
import { uploadMedia } from "../core/utils/cloudinary";
import { IUser } from "../Interfaces/Models/i-user";

@injectable()
export class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;
  private _userRepository: IUserRepository;
  
    constructor(
      @inject('IAdminRepository') adminRepository : IAdminRepository,
      @inject('IUserRepository') userRepository :IUserRepository,
    ) {
      this._userRepository =  userRepository;
      this._adminRepository = adminRepository;
      

    }
  getTotalUsersCount = async (): Promise<number> => {
    try {
      const count = await this._adminRepository.getTotalUsersCount();
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalUsersCount", err);
      throw new ServiceError(
        "Failed to fetch total users count",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getTotalMentorsCount = async (): Promise<number> => {
    try {
      const count = await this._adminRepository.getTotalMentorsCount();
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalMentorsCount", err);
      throw new ServiceError(
        "Failed to fetch total mentors count",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getTotalRevenue = async (): Promise<RevenueStats> => {
    try {
      const revenue = await this._adminRepository.getTotalRevenue();
      return revenue;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTotalRevenue", err);
      throw new ServiceError(
        "Failed to fetch total revenue",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getPendingMentorRequestsCount = async (): Promise<number> => {
    try {
      const count = await this._adminRepository.getPendingMentorRequestsCount();
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getPendingMentorRequestsCount", err);
      throw new ServiceError(
        "Failed to fetch pending mentor requests count",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getActiveCollaborationsCount = async (): Promise<number> => {
    try {
      const count = await this._adminRepository.getActiveCollaborationsCount();
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getActiveCollaborationsCount", err);
      throw new ServiceError(
        "Failed to fetch active collaborations count",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getRevenueTrends = async (
    timeFormat: string,
    days: number
  ): Promise<RevenueTrend[]> => {
    try {
      if (!timeFormat || !days) {
        throw new ServiceError(
          "Invalid parameters: timeFormat and days are required",
          StatusCodes.BAD_REQUEST
        );
      }
      const trends = await this._adminRepository.getRevenueTrends(timeFormat, days);
      return trends;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getRevenueTrends", err);
      throw new ServiceError(
        "Failed to fetch revenue trends",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getUserGrowth = async (
    timeFormat: string,
    days: number
  ): Promise<UserGrowth[]> => {
    try {
      if (!timeFormat || !days) {
        throw new ServiceError(
          "Invalid parameters: timeFormat and days are required",
          StatusCodes.BAD_REQUEST
        );
      }
      const growth = await this._adminRepository.getUserGrowth(timeFormat, days);
      return growth;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getUserGrowth", err);
      throw new ServiceError(
        "Failed to fetch user growth",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getPendingMentorRequests = async (limit?: number): Promise<IMentorDTO[]> => {
    try {
      if (limit && limit < 0) {
        throw new ServiceError(
          "Invalid limit: must be a non-negative number",
          StatusCodes.BAD_REQUEST
        );
      }
      const requests = await this._adminRepository.getPendingMentorRequests(limit);
      return toMentorDTOs(requests);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getPendingMentorRequests", err);
      throw new ServiceError(
        "Failed to fetch pending mentor requests",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getTopMentors = async (limit: number): Promise<TopMentor[]> => {
    try {
      if (!limit || limit < 0) {
        throw new ServiceError(
          "Invalid limit: must be a positive number",
          StatusCodes.BAD_REQUEST
        );
      }
      const mentors = await this._adminRepository.getTopMentors(limit);
      return mentors;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getTopMentors", err);
      throw new ServiceError(
        "Failed to fetch top mentors",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getRecentCollaborations = async (
    limit: number
  ): Promise<ICollaborationDTO[]> => {
    try {
      if (!limit || limit < 0) {
        throw new ServiceError(
          "Invalid limit: must be a positive number",
          StatusCodes.BAD_REQUEST
        );
      }
      const collaborations = await this._adminRepository.getRecentCollaborations(
        limit
      );
      return toCollaborationDTOs(collaborations);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in getRecentCollaborations", err);
      throw new ServiceError(
        "Failed to fetch recent collaborations",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public AdminprofileDetails = async (userId: string): Promise<IUserAdminDTO | null> => {
      try {
        const user = await this._userRepository.findById(userId);
        logger.info(`Fetched profile details for user ${userId}`);
        return toUserAdminDTO(user);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(
          `Error fetching profile details for user ${userId}: ${err.message}`
        );
        throw error instanceof ServiceError
          ? error
          : new ServiceError(
              "Failed to fetch profile details",
              StatusCodes.INTERNAL_SERVER_ERROR,
              err
            );
      }
    };
  
    updateAdminProfile = async (
      userId: string,
      data: ProfileUpdateData
    ): Promise<IUserAdminDTO> => {
      try {
        const user = await this._userRepository.findById(userId);
        if (!user) {
          throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
        }
        let profilePic = user.profilePic ?? undefined;
        if (data.profilePicFile) {
          const { url } = await uploadMedia(
            data.profilePicFile.path,
            "profiles",
            data.profilePicFile.size
          );
          profilePic = url;
        }
        const updatedData: Partial<IUser> = {
          name: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: data.phone ?? user.phone,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : user.dateOfBirth,
          jobTitle: data.jobTitle ?? user.jobTitle,
          industry: data.industry ?? user.industry,
          reasonForJoining: data.reasonForJoining ?? user.reasonForJoining,
          profilePic,
        };
        const updatedUser = await this._userRepository.update(userId, updatedData);
        if (!updatedUser) {
          throw new ServiceError(
            "Failed to update user profile",
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        }
        logger.info(`Updated profile for user ${userId}`);
        return toUserAdminDTO(updatedUser)!;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error updating profile for user ${userId}: ${err.message}`);
        throw error instanceof ServiceError
          ? error
          : new ServiceError(
              "Failed to update user profile",
              StatusCodes.INTERNAL_SERVER_ERROR,
              err
            );
      }
    };
}