export interface IMentorExperienceDTO {
  id: string;
  mentorExperienceId: string;
  mentorId: string;
  role: string;
  organization: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}