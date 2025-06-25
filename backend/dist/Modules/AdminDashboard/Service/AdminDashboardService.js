import AdminRepository from "../Repositry/AdminDashboardRepositry.js";
class AdminService {
    getTotalUsersCount = async () => {
        return await AdminRepository.getTotalUsersCount();
    };
    getTotalMentorsCount = async () => {
        return await AdminRepository.getTotalMentorsCount();
    };
    getTotalRevenue = async () => {
        return await AdminRepository.getTotalRevenue();
    };
    getPendingMentorRequestsCount = async () => {
        return await AdminRepository.getPendingMentorRequestsCount();
    };
    getActiveCollaborationsCount = async () => {
        return await AdminRepository.getActiveCollaborationsCount();
    };
    getRevenueTrends = async (timeFormat, days) => {
        return await AdminRepository.getRevenueTrends(timeFormat, days);
    };
    getUserGrowth = async (timeFormat, days) => {
        return await AdminRepository.getUserGrowth(timeFormat, days);
    };
    getPendingMentorRequests = async (limit) => {
        return await AdminRepository.getPendingMentorRequests(limit);
    };
    getTopMentors = async (limit) => {
        return await AdminRepository.getTopMentors(limit);
    };
    getRecentCollaborations = async (limit) => {
        return await AdminRepository.getRecentCollaborations(limit);
    };
}
export default new AdminService();
//# sourceMappingURL=AdminDashboardService.js.map