import { IUserDTO } from './i-user-dto';
import { ICollaborationDTO } from './i-collaboration-dto';
import { IGroupDTO } from './i-group-dto';

export interface ITaskDTO {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  image?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'not-completed';
  startDate: Date;
  dueDate: Date;
  notificationDate?: Date;
  notificationTime?: string;
  contextType: 'user' | 'group' | 'collaboration';
  contextId: string;
  context?: IUserDTO | IGroupDTO | ICollaborationDTO; // Populated context (User, Group, or Collaboration)
  assignedUsers: string[]; // Array of user IDs
  assignedUsersDetails?: IUserDTO[]; // Populated user details
  createdBy: string; // User ID
  createdByDetails?: IUserDTO; // Populated user details
  createdAt: Date;
}