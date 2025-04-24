export interface Contact {
  id: string;
  contactId: string;
  userId: string;
  targetId: string;
  type: "user-mentor" | "user-user" | "group";
  name: string;
  profilePic: string;
  targetJobTitle?: string;
  collaborationId?: string;
  collaborationDetails?: {
    startDate: Date;
    endDate?: Date;
    price: number;
    selectedSlot: { day: string; timeSlots: string[] }[];
    mentorName: string;
    mentorProfilePic: string;
    mentorJobTitle?: string;
    userName: string;
    userProfilePic: string;
    userJobTitle?: string;
  };
  userConnectionId?: string;
  connectionDetails?: {
    requestAcceptedAt?: Date;
    requesterName: string;
    requesterProfilePic: string;
    requesterJobTitle?: string;
    recipientName: string;
    recipientProfilePic: string;
    recipientJobTitle?: string;
  };
  groupId?: string;
  groupDetails?: {
    startDate: Date;
    adminName: string;
    adminProfilePic: string;
    members: { 
      userId: string; 
      name: string; 
      profilePic: string; 
      _id?: string
      joinedAt: Date 
    }[];
  };
}

export const formatContact = (contact: any): Contact => ({
  id: contact.targetId,
  contactId: contact._id,
  userId: contact.userId, 
  targetId: contact.targetId,
  collaborationId: contact?.collaborationId,
  userConnectionId: contact?.userConnectionId,
  groupId: contact?.groupId,
  name: contact.targetName || "Unknown",
  profilePic: contact.targetProfilePic || "",
  type: contact.type,
});

export interface IChatMessage {
  _id: string;
  senderId: string;
  content: string;
  thumbnailUrl?: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read";
  timestamp: string;
  caption?: string;
}

  
export interface Notification {
  _id: string;
  userId: string;
  type: "message" | "incoming_call" | "missed_call";
  content: string;
  relatedId: string;
  status: "unread" | "read";
  callId?: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
}