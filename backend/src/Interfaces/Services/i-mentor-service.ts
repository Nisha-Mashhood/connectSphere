import { IMentor } from "../Models/i-mentor";
import { CompleteMentorDetails, MentorAnalytics, MentorExperienceInput, MentorQuery, SalesReport } from "../../Utils/types/mentor-types";
import { IMentorDTO } from "../DTOs/i-mentor-dto";
import { IMentorExperienceDTO } from "../DTOs/i-mentor-experience-dto";
import { IMentorExperience } from "../Models/i-mentor-experience";

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
    experiences?: MentorExperienceInput[]
  }) => Promise<IMentorDTO | null>;
  getAllMentorRequests: (
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    sort?: "asc" | "desc"
  ) => Promise<{
    mentors: IMentorDTO[];
    total: number;
    page: number;
    pages: number;
  }>;
  getAllMentors: (query: MentorQuery) => Promise<{ mentors: CompleteMentorDetails[]; total: number }>;
  getMentorByMentorId: (mentorId: string) => Promise<IMentorDTO | null>;
  getMentorExperiences: (mentorId: string)=> Promise<IMentorExperienceDTO[]>
  approveMentorRequest: (id: string) => Promise<void>;
  rejectMentorRequest: (id: string, reason: string) => Promise<void>;
  cancelMentorship: (id: string) => Promise<void>;
  getMentorByUserId: (userId: string) => Promise<IMentorDTO | null>;
  updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentorDTO | null>;
  getMentorAnalytics: (
    page?: number,
    limit?: number,
    sortBy?: "totalEarnings" | "platformFees" | "totalCollaborations" | "avgCollabPrice",
    sortOrder?: "asc" | "desc",
    search?: string
  ) => Promise<{
    mentors: MentorAnalytics[];
    total: number;
    page: number;
    pages: number;
  }>;
  getSalesReport: (period: string) => Promise<SalesReport>;
  addMentorExperience: (userId: string, data: Partial<IMentorExperience>)=> Promise<IMentorExperienceDTO>
  updateMentorExperience: (userId: string, experienceId: string, data: Partial<IMentorExperience>)=> Promise<IMentorExperienceDTO>
  deleteMentorExperience: (userId: string, experienceId: string)=> Promise<void>;
  generateSalesReportPDF: (period: string )=> Promise<Buffer>
}