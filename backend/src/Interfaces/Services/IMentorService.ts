import { IMentor } from "../../Interfaces/Models/IMentor";
import { MentorAnalytics, MentorQuery, SalesReport } from "../../Utils/Types/mentor.types";

export interface IMentorService {
  submitMentorRequest: (mentorData: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
  }) => Promise<IMentor>;
  getAllMentorRequests: (
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    sort?: "asc" | "desc"
  ) => Promise<{
    mentors: IMentor[];
    total: number;
    page: number;
    pages: number;
  }>;
  getAllMentors: (query: MentorQuery) => Promise<{ mentors: IMentor[]; total: number }>;
  getMentorByMentorId: (mentorId: string) => Promise<IMentor | null>;
  approveMentorRequest: (id: string) => Promise<void>;
  rejectMentorRequest: (id: string, reason: string) => Promise<void>;
  cancelMentorship: (id: string) => Promise<void>;
  getMentorByUserId: (userId: string) => Promise<IMentor | null>;
  updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
  getMentorAnalytics: (
    page?: number,
    limit?: number,
    sortBy?: "totalEarnings" | "platformFees" | "totalCollaborations" | "avgCollabPrice",
    sortOrder?: "asc" | "desc"
  ) => Promise<{
    mentors: MentorAnalytics[];
    total: number;
    page: number;
    pages: number;
  }>;
  getSalesReport: (period: string) => Promise<SalesReport>;
}