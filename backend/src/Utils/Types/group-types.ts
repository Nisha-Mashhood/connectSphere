import { Types } from 'mongoose';
import { TimeSlot } from '../../Interfaces/Models/i-group';

export interface GroupFormData {
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  availableSlots: TimeSlot[];
  profilePic?: string;
  coverPic?: string;
  startDate?: string;
  adminId: string | Types.ObjectId;
  createdAt?: Date;
  members?: string[];
}

export interface GroupQuery {
  search?: string;
  page?: number;
  limit?: number;
  excludeAdminId?: string;
}