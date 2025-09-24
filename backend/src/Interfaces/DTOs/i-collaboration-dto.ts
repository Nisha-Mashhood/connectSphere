import { IUserDTO } from "./i-user-dto";
import { IMentorDTO } from "./i-mentor-dto";

export interface SelectedSlotDTO {
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  timeSlots: string[];
}

export interface UnavailableDayDTO {
  id: string;
  datesAndReasons: { date: Date; reason: string }[];
  requestedBy: "user" | "mentor";
  requesterId: string; 
  isApproved: "pending" | "approved" | "rejected";
  approvedById: string; 
}

export interface TemporarySlotChangeDTO {
  id: string;
  datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
  requestedBy: "user" | "mentor";
  requesterId: string; 
  isApproved: "pending" | "approved" | "rejected";
  approvedById: string; 
}

export interface ICollaborationDTO {
  id: string;
  collaborationId: string;
  mentorId: string;
  mentor?: IMentorDTO; // Populated mentor details when available
  userId: string; 
  user?: IUserDTO; // Populated user details when available
  selectedSlot: SelectedSlotDTO[];
  unavailableDays: UnavailableDayDTO[];
  temporarySlotChanges: TemporarySlotChangeDTO[];
  price: number;
  payment: boolean;
  paymentIntentId?: string;
  isCancelled: boolean;
  isCompleted: boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
  createdAt: Date;
}