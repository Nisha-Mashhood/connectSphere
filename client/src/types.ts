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

// export interface IChatMessage {
//   _id: string; 
//   senderId: string;
//   content: string;
//   contentType: "text" | "image" | "file" | "audio" | "video";
//   thumbnailUrl?: string;
//   timestamp: string | Date;
//   caption?: string;
//   groupId?: string;
//   status: "pending" | "sent" | "read";
//   collaborationId?: string;
//   userConnectionId?: string;
//   fileMetadata?: {
//     fileName: string;
//     fileSize: number;
//     mimeType: string;
//   }; 
// }

export interface Notification {
  contactId: string;
  type: "user-mentor" | "user-user" | "group";
  message: string;
  timestamp: string | Date;
  senderId?: string; 
}
  
  // export interface IChatMessage {
  //   _id: string;
  //   senderId: string;
  //   content: string;
  //   contentType: "text" | "image" | "file" | "video";
  //   thumbnailUrl?: string;
  //   timestamp: string;
  //   collaborationId?: string;
  //   userConnectionId?: string;
  //   groupId?: string;
  //   fileMetadata?: {
  //     fileName: string;
  //     fileSize: number;
  //     mimeType: string;
  //   };
  // }
  
  // export interface Notification {
  //   contactId: string;
  //   type: "user-mentor" | "user-user" | "group";
  //   message: string;
  //   timestamp: string;
  // }