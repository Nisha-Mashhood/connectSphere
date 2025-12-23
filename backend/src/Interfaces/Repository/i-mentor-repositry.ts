import { IMentor } from "../Models/i-mentor";
import { CompleteMentorDetails, MentorQuery } from "../../Utils/types/mentor-types";
import { ClientSession } from "mongoose";

export interface IMentorRepository {
  getAllMentorRequests(
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    sort?: string
  ): Promise<{
    mentors: IMentor[];
    total: number;
    page: number;
    pages: number;
  }>;
  getAllMentors(query?: MentorQuery): Promise<{ mentors: CompleteMentorDetails[]; total: number }>;
  getMentorDetails(id: string): Promise<IMentor | null>;
  approveMentorRequest(id: string): Promise<IMentor | null>;
  rejectMentorRequest(id: string): Promise<IMentor | null>;
  cancelMentorship(id: string, options?: { session?: ClientSession }): Promise<IMentor | null>;
  getMentorById(id: string): Promise<IMentor | null>;
  getMentorByUserId(userId: string): Promise<IMentor | null>;
  updateMentorById(mentorId: string, updateData: Partial<IMentor>): Promise<IMentor | null>;
  saveMentorRequest(data: {
    userId: string;
    skills: string[];
    specialization: string;
    bio: string;
    price: number;
    availableSlots: object[];
    timePeriod: number;
    certifications: string[];
  }, options?: { session?: ClientSession }
): Promise<IMentor>;
}