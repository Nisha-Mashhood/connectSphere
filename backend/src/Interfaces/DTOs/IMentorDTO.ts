export interface IMentorDTO {
  id: string;
  mentorId: string;
  userId: string;
  isApproved?: string;
  rejectionReason?: string;
  skills?: string[];
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots?: object[];
  timePeriod?: number;
  createdAt: Date;
  updatedAt: Date;
}
