export interface ICollaborationDTO {
  id: string;
  collaborationId: string;
  mentorId: string;
  userId: string; 
  selectedSlot: {
    day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
    timeSlots: string[];
  }[];
  unavailableDays: {
    id: string;
    datesAndReasons: { date: Date; reason: string }[];
    requestedBy: "user" | "mentor";
    requesterId: string;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: string;
  }[];
  temporarySlotChanges: {
    id: string;
    datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
    requestedBy: "user" | "mentor";
    requesterId: string;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: string;
  }[];
  price: number;
  payment: boolean;
  paymentIntentId: string;
  isCancelled: boolean;
  isCompleted: boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
  createdAt: Date;
}