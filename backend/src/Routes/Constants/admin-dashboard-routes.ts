export const ADMIN_DASHBOARD_ROUTES = {
  GetTotalUsers: '/total-users',
  GetTotalMentors: '/total-mentors',
  GetTotalRevenue: '/total-revenue',
  GetPendingMentorRequestsCount: '/pending-mentor-requests/count',
  GetActiveCollaborationsCount: '/active-collaborations/count',
  GetRevenueTrends: '/revenue-trends',
  GetUserGrowth: '/user-growth',
  GetPendingMentorRequests: '/pending-mentor-requests',
  GetTopMentors: '/top-mentors',
  GetRecentCollaborations: '/recent-collaborations',
  GetAdminDetails:'/details/:id',
  UpdateAdminDetails:'/update-profile/:id'
} as const;