import AdminRepository from "../Repositry/AdminDashboardRepositry";

class AdminService {
   getTotalUsersCount = async() => {
    return await AdminRepository.getTotalUsersCount();
  }

   getTotalMentorsCount = async() => {
    return await AdminRepository.getTotalMentorsCount();
  }

   getTotalRevenue = async() => {
    return await AdminRepository.getTotalRevenue();
  }

   getPendingMentorRequestsCount = async() => {
    return await AdminRepository.getPendingMentorRequestsCount();
  }

   getActiveCollaborationsCount = async() => {
    return await AdminRepository.getActiveCollaborationsCount();
  }

   getRevenueTrends = async(timeFormat: string, days: number) => {
    return await AdminRepository.getRevenueTrends(timeFormat, days);
  }

   getUserGrowth = async(timeFormat: string, days: number) => {
    return await AdminRepository.getUserGrowth(timeFormat, days);
  }

   getPendingMentorRequests = async(limit?: number) => {
    return await AdminRepository.getPendingMentorRequests(limit);
  }

   getTopMentors = async(limit: number) =>{
    return await AdminRepository.getTopMentors(limit);
  }

   getRecentCollaborations = async(limit: number) =>{
    return await AdminRepository.getRecentCollaborations(limit);
  }
}

export default new AdminService();