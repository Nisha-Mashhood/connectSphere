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
    groupName: string;
    startDate: Date;
    adminName: string;
    adminProfilePic: string;
    maxMembers: number;
    bio: string;
    price: number;
    availableSlots: { day: string; timeSlots: string[] }[];
    members: { 
      userId: string; 
      name: string; 
      profilePic: string; 
      joinedAt: Date 
    }[];
  };
  lastMessageTimestamp?: string;
}


export const formatContact = (contact): Contact => ({
  id: contact.targetId,
  contactId: contact._id,
  userId: contact.userId,
  targetId: contact.targetId,
  collaborationId: contact?.collaborationId,
  collaborationDetails: contact?.collaborationDetails,
  userConnectionId: contact?.userConnectionId,
  connectionDetails: contact?.connectionDetails,
  groupId: contact?.groupId,
  groupDetails: contact?.groupDetails,
  name: contact.targetName || "Unknown",
  profilePic: contact.targetProfilePic || "",
  type: contact.type,
  targetJobTitle: contact.targetJobTitle,
});
