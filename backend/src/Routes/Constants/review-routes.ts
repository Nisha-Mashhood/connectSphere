export const REVIEW_ROUTES = {
  SubmitReview: '/submit',
  SkipReview: '/skip',
  GetAllReviews: '/all',
  ApproveReview: '/approve/:reviewId',
  SelectReview: '/select/:reviewId',
  GetSelectedReviews: '/selected',
  CancelApproval: '/cancel/:reviewId',
  DeselectReview: '/deselect/:reviewId',
} as const;