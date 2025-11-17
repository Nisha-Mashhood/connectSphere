import { RevenueStats, RevenueTrend, TopMentor, UserGrowth } from "../../Utils/types/admin-types";
import { ICollaboration } from "../Models/i-collaboration";
import { IMentor } from "../Models/i-mentor";

export interface IAdminRepository {
  getTotalUsersCount(): Promise<number>;
  getTotalMentorsCount(): Promise<number>;
  getTotalRevenue(): Promise<RevenueStats>;
  getPendingMentorRequestsCount(): Promise<number>;
  getActiveCollaborationsCount(): Promise<number>;
  getRevenueTrends(timeFormat: string, days: number): Promise<RevenueTrend[]>;
  getUserGrowth(timeFormat: string, days: number): Promise<UserGrowth[]>;
  getPendingMentorRequests(limit?: number): Promise<IMentor[]>;
  getTopMentors(limit: number): Promise<TopMentor[]>;
  getRecentCollaborations(limit: number): Promise<ICollaboration[]>;

}