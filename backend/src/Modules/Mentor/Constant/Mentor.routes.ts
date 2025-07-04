export const MENTOR_ROUTES = {
  CreateMentorProfile: '/create-mentorprofile',
  CheckMentorStatus: '/check-mentor/:id',
  GetAllMentorRequests: '/getallmentorrequest',
  ApproveMentorRequest: '/approvementorrequest/:id',
  RejectMentorRequest: '/rejectmentorrequest/:id',
  CancelMentorship: '/cancelmentorship/:mentorId',
  GetMentorDetails: '/getmentorDetails/:mentorId',
  UpdateMentorProfile: '/update-mentor/:mentorId',
  GetAllMentors: '/getAllMentors',
  GetMentorByUserId: '/user/:userId',
  GetMentorAnalytics: '/mentor-analytics',
  GetSalesReport: '/sales-report',
} as const;