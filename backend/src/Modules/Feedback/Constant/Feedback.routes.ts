export const FEEDBACK_ROUTES = {
  SendFeedback: '/send-feedback',
  GetFeedbackForProfile: '/profile/:profileId/:profileType',
  GetFeedbackByCollabId: '/get-feedbackByCollabId/:collabId',
  ToggleVisibility: '/toggle-visibility/:feedbackId',
  GetFeedbackByMentorId: '/get-feedbackByMentorId/:mentorId',
  GetMentorFeedbacks: '/mentor/:mentorId',
  GetUserFeedbacks: '/user/:userId',
} as const;