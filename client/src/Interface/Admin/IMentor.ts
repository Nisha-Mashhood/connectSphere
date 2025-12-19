export interface IMentorExperience {
  id: string;
  mentorExperienceId: string;
  mentorId: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}