import { IUserDTO } from './i-user-dto';
import { ICollaborationDTO } from './i-collaboration-dto';
import { IUserConnectionDTO } from './i-user-connection-dto';
import { IGroupDTO } from './i-group-dto';

export interface IChatMessageDTO {
  id: string;
  ChatId: string;
  senderId: string;
  sender?: IUserDTO; // Populated sender details when available
  content: string;
  thumbnailUrl?: string;
  collaborationId?: string;
  collaboration?: ICollaborationDTO; // Populated collaboration details when available
  userConnectionId?: string;
  userConnection?: IUserConnectionDTO; // Populated user connection details when available
  groupId?: string
  group?: IGroupDTO; // Populated group details when available
  contentType: 'text' | 'image' | 'video' | 'file';
  fileMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  isRead: boolean;
  status: 'pending' | 'sent' | 'read';
  timestamp: Date;
}