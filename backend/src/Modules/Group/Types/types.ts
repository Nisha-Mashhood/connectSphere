import { Types } from 'mongoose';
import { TimeSlot } from '../../../Interfaces/models/GroupDocument';

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
