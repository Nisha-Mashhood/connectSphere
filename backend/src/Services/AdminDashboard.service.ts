import { inject, injectable } from "inversify";
import logger from "../Core/Utils/Logger";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { IAdminService } from "../Interfaces/Services/IAdminService";
import {
  RevenueStats,
  RevenueTrend,
  TopMentor,
  UserGrowth,
} from "../Utils/Types/Admin.types";
import { ICollaboration } from "../Interfaces/Models/ICollaboration";
import { IMentor } from "../Interfaces/Models/IMentor";
import { IAdminRepository } from "src/Interfaces/Repository/IAdminRepositry";

@injectable()
export class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;
  
    constructor(@inject('IAdminRepository') adminRepository : IAdminRepository) {
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

  getPendingMentorRequests = async (limit?: number): Promise<IMentor[]> => {
    try {
      if (limit && limit < 0) {
        throw new ServiceError(
          "Invalid limit: must be a non-negative number",
          StatusCodes.BAD_REQUEST
        );
      }
      const requests = await this._adminRepository.getPendingMentorRequests(limit);
      return requests;
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
  ): Promise<ICollaboration[]> => {
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
      return collaborations;
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
}