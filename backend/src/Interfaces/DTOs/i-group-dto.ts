import { IUserDTO } from "./i-user-dto";

export interface TimeSlotDTO {
  day: string;
  timeSlots: string[];
}

export interface IGroupDTO {
  id: string;
  groupId: string;
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  isFull: boolean;
  availableSlots: TimeSlotDTO[];
  profilePic: string;
  coverPic: string;
  startDate: Date;
  adminId: string;
  admin?: IUserDTO;
  members: { userId: string; joinedAt: Date }[];
  membersDetails?: { user: IUserDTO; joinedAt: Date }[];
  createdAt: Date;
}