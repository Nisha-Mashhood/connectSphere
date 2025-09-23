import { IUserDTO } from "./IUserDTO";
import { IMentorDTO } from "./IMentorDTO";

export interface IMentorRequestDTO {
  id: string;
  mentorRequestId: string;
  mentorId: string;
  mentor?: IMentorDTO; // Populated mentor details when available
  userId: string; 
  user?: IUserDTO; // Populated user details when available
  selectedSlot?: {
    day: string;
    timeSlots: string[];
  };
  price: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  timePeriod: number;
  isAccepted: "Pending" | "Accepted" | "Rejected";
  createdAt: Date;
}