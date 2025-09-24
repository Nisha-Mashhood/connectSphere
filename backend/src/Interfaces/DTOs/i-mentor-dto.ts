import { IUserDTO } from "./i-user-dto";
import { ISkillDTO } from "./i-skill-dto";

export interface IMentorDTO {
  id: string;
  mentorId: string;
  userId: string; 
  user?: IUserDTO; 
  isApproved?: string;
  rejectionReason?: string;
  skills?: string[]; 
  skillsDetails?: ISkillDTO[]; 
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots?: object[];
  timePeriod?: number;
  createdAt: Date;
  updatedAt: Date;
}