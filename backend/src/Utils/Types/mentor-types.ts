import { Types } from "mongoose";

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
  excludeMentorId?:string;
}

export interface CompleteMentorDetails {
  id: string;
  mentorId?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  skills: {
    _id: string;
    name: string;
    subcategoryId: string;
  }[];
  categories?: {
    name: string;
  }[];
  isApproved?: string;
  rejectionReason?: string;
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots?: object[];
  timePeriod?: number;
  avgRating: number;
  feedbackCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MentorExperienceInput = {
  mentorId?: string | Types.ObjectId;
  role: string;
  organization: string;
  startDate: Date | string;
  endDate?: Date | string;
  isCurrent: boolean;
  description?: string;
};