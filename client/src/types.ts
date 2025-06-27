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
  type: "message" | "incoming_call" | "missed_call" | "task_reminder";
  content: string;
  relatedId: string;
  status: "unread" | "read";
  callId?: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  taskContext?: {
    contextType: "profile" | "group" | "collaboration" ;
    contextId: string;
  };
}

export interface CallOffer {
  sdp: string;
  type: "offer";
}

export interface CallAnswer {
  sdp: string;
  type: "answer";
}

export interface IceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export interface GroupCallOfferData {
  groupId: string;
  offer: RTCSessionDescriptionInit;
  callerId: string;
  callType: "audio" | "video";
  callId: string;
}
export interface GroupCallAnswerData {
  groupId: string;
  answer: RTCSessionDescriptionInit;
  answererId: string;
  callerId: string;
  callType: "audio" | "video";
  callId: string;
}
export interface GroupIceCandidateData {
  groupId: string;
  candidate: RTCIceCandidateInit;
  senderId: string;
  recipientId: string;
  callType: "audio" | "video";
  callId: string;
}
export interface GroupCallEndedData {
  groupId: string;
  userId: string;
  callType: "audio" | "video";
  callId: string;
}


export interface Group {
  _id: string;
  groupId: string;
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  isFull: boolean;
  availableSlots: {
    day: string;
    timeSlots: string[];
  }[];
  profilePic: string;
  coverPic: string;
  startDate: string; 
  adminId: string;
  members: {
    userId: string;
    joinedAt: string;
  }[];
  createdAt: string;
}


export interface GroupRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePic: string;
  };
  groupId: {
    _id: string;
    name: string;
    price: number;
  };
  status: "Pending" | "Accepted" | "Rejected";
  paymentStatus: "Paid" | "Unpaid";
  createdAt: string;
}


export interface Feedback {
  _id:string;
  feedbackId: string;
  userId: { _id: string; name: string };
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  isHidden: boolean;
}

export interface Review {
  reviewId: string;
  userId: { username: string; email: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone:number,
  reasonForJoining:string,
  industry:string,
  jobTitle: string;
  profilePic: string;
}

export interface UserConnection {
  _id: string;
  requester: User;
  recipient: User;
  requestStatus: string; 
  connectionStatus: string; 
  requestSentAt: string;
  createdAt: string;
  updatedAt: string;
  disconnectionReason: string | null;
}

export interface MentorForCollab {
  _id: string;
  userId: User;
  specialization: string;
}

export interface MentorRequest {
  _id: string;
  mentorRequestId: string;
  mentorId: MentorForCollab;
  userId: User;
  selectedSlot: {
    day: string;
    timeSlots: string[];
  };
  price: number;
  timePeriod: number;
  paymentStatus: string;
  isAccepted: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaboration {
  _id: string;
  collaborationId: string;
  mentorId: MentorForCollab;
  userId: User;
  selectedSlot: {
    day: string;
    timeSlots: string[];
  }[];
  unavailableDays: {
    _id: string;
    datesAndReasons: { date: string; reason: string }[];
    requestedBy: string;
    requesterId: string;
    isApproved: string;
    approvedById: string;
  }[];
  temporarySlotChanges: {
    _id: string;
    datesAndNewSlots: { date: string; newTimeSlots: string[] }[];
    requestedBy: string;
    requesterId: string;
    isApproved: string;
    approvedById: string;
  }[];
  price: number;
  payment: boolean;
  isCancelled: boolean;
  startDate: string;
  endDate?: string;
  feedbackGiven: boolean;
  createdAt: string;
}