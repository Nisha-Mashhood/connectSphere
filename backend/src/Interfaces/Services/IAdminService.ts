import { RevenueStats, RevenueTrend, TopMentor, UserGrowth } from "../../Utils/Types/Admin.types";
import { ICollaboration } from "../../Interfaces/Models/ICollaboration";
import { IMentor } from "../../Interfaces/Models/IMentor";

export interface IAdminService {
  getTotalUsersCount: () => Promise<number>;
  getTotalMentorsCount: () => Promise<number>;
  getTotalRevenue: () => Promise<RevenueStats>;
  getPendingMentorRequestsCount: () => Promise<number>;
  getActiveCollaborationsCount: () => Promise<number>;
  getRevenueTrends: (timeFormat: string, days: number) => Promise<RevenueTrend[]>;
  getUserGrowth: (timeFormat: string, days: number) => Promise<UserGrowth[]>;
  getPendingMentorRequests: (limit?: number) => Promise<IMentor[]>;
  getTopMentors: (limit: number) => Promise<TopMentor[]>;
  getRecentCollaborations: (limit: number) => Promise<ICollaboration[]>;
}