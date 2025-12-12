import mongoose from "mongoose";

//PopulatedContact interface 
export interface PopulatedContact {
  _id: string | mongoose.Types.ObjectId;
  contactId: string;
  userId: {
    _id: string;
    name?: string;
    profilePic?: string;
    jobTitle?: string;
  };
  targetUserId?: {
    _id: string;
    name?: string;
    profilePic?: string;
    jobTitle?: string;
  };
  collaborationId?: {
    _id: string;
    mentorId: {
      userId: {
        _id: string;
        name?: string;
        profilePic?: string;
        jobTitle?: string;
      };
    };
    userId: {
      _id: string;
      name?: string;
      profilePic?: string;
      jobTitle?: string;
    };
    startDate: Date;
    endDate?: Date;
    price: number;
    selectedSlot: { day: string; timeSlots: string[] }[];
  };
  userConnectionId?: {
    _id: string;
    requester: {
      _id: string;
      name?: string;
      profilePic?: string;
      jobTitle?: string;
    };
    recipient: {
      _id: string;
      name?: string;
      profilePic?: string;
      jobTitle?: string;
    };
    requestAcceptedAt?: Date;
  };
  groupId?: {
    _id: string;
    name?: string;
    profilePic?: string;
    startDate: Date;
    adminId: {
      _id: string;
      name?: string;
      profilePic?: string;
    };
    bio:string,
    price:number,
    maxMembers:number,
    availableSlots:{ day: string; timeSlots: string[] }[];
    members: { userId: { _id: string; name?: string; profilePic?: string }; joinedAt: Date }[];
  };
  type: "user-mentor" | "user-user" | "group";
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    timestamp: Date;
  };
}

export interface FormattedContact {
  _id: string;
  contactId: string;
  userId: string;
  targetId: string;
  type: 'user-mentor' | 'user-user' | 'group';
  targetName: string;
  targetProfilePic: string;
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
    bio: string;
    price: number;
    maxMembers: number;
    availableSlots: { day: string; timeSlots: string[] }[];
    members: { userId: string; name: string; profilePic: string; joinedAt: Date }[];
  };
  lastMessageTimestamp?: string;
}

export interface LastMessageSummary{
  content: string;
  senderId: string;
  timestamp: Date;
  contentType: "text" | "image" | "video" | "file";
}