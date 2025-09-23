import { IUserDTO } from "./IUserDTO";
import { ISkillDTO } from "./ISkillDTO";

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