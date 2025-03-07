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
    async getRevenueTrends(timeFormat, days) {
        return await AdminRepository.getRevenueTrends(timeFormat, days);
    }
    async getUserGrowth(timeFormat, days) {
        return await AdminRepository.getUserGrowth(timeFormat, days);
    }
    async getPendingMentorRequests(limit) {
        return await AdminRepository.getPendingMentorRequests(limit);
    }
    async getTopMentors(limit) {
        return await AdminRepository.getTopMentors(limit);
    }
    async getRecentCollaborations(limit) {
        return await AdminRepository.getRecentCollaborations(limit);
    }
}
export default new AdminService();
//# sourceMappingURL=adminDashoard.service.js.map