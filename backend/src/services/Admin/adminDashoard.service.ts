import AdminRepository from "../../repositories/Admin/adminDashboard.repositry.js";

class AdminService {
  async getTotalUsersCount() {
    return await AdminRepository.getTotalUsersCount();
  }

  async getTotalMentorsCount() {
    return await AdminRepository.getTotalMentorsCount();
  }

  async getTotalRevenue() {
    return await AdminRepository.getTotalRevenue();
  }

  async getPendingMentorRequestsCount() {
    return await AdminRepository.getPendingMentorRequestsCount();
  }

  async getActiveCollaborationsCount() {
    return await AdminRepository.getActiveCollaborationsCount();
  }

  async getRevenueTrends(timeFormat: string, days: number) {
    return await AdminRepository.getRevenueTrends(timeFormat, days);
  }

  async getUserGrowth(timeFormat: string, days: number) {
    return await AdminRepository.getUserGrowth(timeFormat, days);
  }

  async getPendingMentorRequests(limit?: number) {
    return await AdminRepository.getPendingMentorRequests(limit);
  }

  async getTopMentors(limit: number) {
    return await AdminRepository.getTopMentors(limit);
  }

  async getRecentCollaborations(limit: number) {
    return await AdminRepository.getRecentCollaborations(limit);
  }
}

export default new AdminService();