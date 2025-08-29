export interface MentorAnalytics {
  mentorId: string;
  name: string;
  email: string;
  specialization: string | undefined;
  approvalStatus: string | undefined;
  totalCollaborations: number;
  totalEarnings: number;
  platformFees: number;
  avgCollabPrice: number;
}

export interface MentorBreakdown {
  mentorId: string;
  name: string | undefined;
  email: string | undefined;
  collaborations: number;
  mentorEarnings: number;
  platformFees: number;
}

export interface SalesReport {
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  mentorRevenue: number;
  mentorBreakdown: MentorBreakdown[];
}

export interface MentorQuery {
  search?: string;
  page?: number;
  limit?: number;
  skill?: string;
  category?: string;
  sortBy?: 'rating' | 'price' | 'feedbackCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}