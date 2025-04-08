export interface Contact {
  id: string;
  contactId: string;
  userId: string; 
  targetId: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  name: string;
  profilePic: string;
  type: "user-mentor" | "user-user" | "group";
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
    contentType: "text" | "image" | "file" | "video";
    thumbnailUrl?: string;
    timestamp: string;
    collaborationId?: string;
    userConnectionId?: string;
    groupId?: string;
    fileMetadata?: {
      fileName: string;
      fileSize: number;
      mimeType: string;
    };
  }
  
  export interface Notification {
    contactId: string;
    type: "user-mentor" | "user-user" | "group";
    message: string;
    timestamp: string;
  }