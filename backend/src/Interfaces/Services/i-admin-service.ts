import { RevenueStats, RevenueTrend, TopMentor, UserGrowth } from "../../Utils/types/admin-types";
import { IMentorDTO } from "../DTOs/i-mentor-dto";
import { ICollaborationDTO } from "../DTOs/i-collaboration-dto";
import { IUserAdminDTO } from "../DTOs/i-user-dto";
import { ProfileUpdateData } from "../../Utils/types/auth-types";

export interface IAdminService {
  getTotalUsersCount: () => Promise<number>;
  getTotalMentorsCount: () => Promise<number>;
  getTotalRevenue: () => Promise<RevenueStats>;
  getPendingMentorRequestsCount: () => Promise<number>;
  getActiveCollaborationsCount: () => Promise<number>;
  getRevenueTrends: (timeFormat: string, days: number) => Promise<RevenueTrend[]>;
  getUserGrowth: (timeFormat: string, days: number) => Promise<UserGrowth[]>;
  getPendingMentorRequests: (limit?: number) => Promise<IMentorDTO[]>;
  getTopMentors: (limit: number) => Promise<TopMentor[]>;
  getRecentCollaborations: (limit: number) => Promise<ICollaborationDTO[]>;
  AdminprofileDetails: (userId: string) => Promise<IUserAdminDTO | null>
  updateAdminProfile: (userId: string, data: ProfileUpdateData ) => Promise<IUserAdminDTO>
}