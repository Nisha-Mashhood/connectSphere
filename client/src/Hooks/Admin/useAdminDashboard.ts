import { useState, useEffect, useCallback } from "react";
import {
  getTotalUsersCount,
  getTotalMentorsCount,
  getTotalRevenue,
  getPendingMentorRequestsCount,
  getActiveCollaborationsCount,
  getRevenueTrends,
  getUserGrowth,
  getPendingMentorRequests,
  getTopMentors,
  getRecentCollaborations
} from "../../Service/Admin.Service";

export const useAdminDashboardData = (timeFormat: string, timeRange: string) => {
  const [isLoading, setIsLoading] = useState(true);

  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalRevenue: 0,
    pendingRequests: 0,
    activeCollaborations: 0,
  });

  const [revenueTrends, setRevenueTrends] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [recentCollaborations, setRecentCollaborations] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        users,
        mentors,
        revenue,
        pendingReqs,
        activeCollab,
        revData,
        growthData,
        pendingMentorsList,
        topMentorsList,
        recentCollabsList,
      ] = await Promise.all([
        getTotalUsersCount(),
        getTotalMentorsCount(),
        getTotalRevenue(),
        getPendingMentorRequestsCount(),
        getActiveCollaborationsCount(),
        getRevenueTrends(timeFormat, timeRange),
        getUserGrowth(timeFormat, timeRange),
        getPendingMentorRequests(5),
        getTopMentors(5),
        getRecentCollaborations(5),
      ]);

      setStatsData({
        totalUsers: users?.totalUsers || 0,
        totalMentors: mentors?.totalMentors || 0,
        totalRevenue: revenue?.totalRevenue || 0,
        pendingRequests: pendingReqs?.pendingMentorRequests || 0,
        activeCollaborations: activeCollab?.activeCollaborations || 0,
      });

      // Revenue chart
      const formattedRevenue = revData?.map((item) => ({
        date: item.name,
        amount: item.totalRevenue,
      })) || [];
      setRevenueTrends(formattedRevenue);

      // User growth chart
      setUserGrowth(growthData || []);

      // Pending mentors
      const formattedPending = pendingMentorsList?.map((mentor) => ({
        name: mentor?.user?.name || "Unknown",
        email: mentor?.user?.email || "No email",
        requestId: mentor.id,
      })) || [];
      console.log('Pending Mentors : ',pendingMentorsList);
      setPendingMentors(formattedPending);

      // Top mentors
      const formattedTop = topMentorsList?.map((mentor) => ({
        name: mentor?.name || "Unknown",
        sessionCount: mentor.collaborationCount || 0,
        rating: mentor?.rating || "No feedback",
        userId: mentor?.userId,
      })) || [];
      setTopMentors(formattedTop);

      // Recent collaborations
      const formattedCollabs = recentCollabsList?.map((collab) => ({
        mentorName: collab.mentor?.user?.name || "Unknown Mentor",
        userName: collab.user?.name || "Unknown User",
        skill: collab.mentor?.specialization || "General Mentoring",
        startDate: collab.createdAt,
        collabId: collab.id,
      })) || [];
      setRecentCollaborations(formattedCollabs);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFormat, timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    isLoading,
    statsData,
    revenueTrends,
    userGrowth,
    pendingMentors,
    topMentors,
    recentCollaborations,
    refresh: fetchDashboardData,
  };
};
