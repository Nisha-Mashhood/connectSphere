export interface IMentorRequestDTO {
  id: string;
  mentorRequestId: string;
  mentorId: string;
  userId: string;
  selectedSlot: {
    day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
    timeSlots: string[];
  };
  price: number;
  timePeriod: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  isAccepted: string;
  createdAt: Date;
  updatedAt: Date;
}
