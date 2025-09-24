import { IUserDTO } from './i-user-dto';
import { IMentorDTO } from './i-mentor-dto';
import { ICollaborationDTO } from './i-collaboration-dto';

export interface IFeedbackDTO {
  id: string;
  feedbackId: string;
  userId: string; 
  user?: IUserDTO; // Populated user details when available
  mentorId: string; 
  mentor?: IMentorDTO; // Populated mentor details when available
  collaborationId: string;
  collaboration?: ICollaborationDTO; // Populated collaboration details when available
  givenBy: "user" | "mentor";
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  isHidden: boolean;
  createdAt: Date;
}