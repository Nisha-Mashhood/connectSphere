import { User } from "./redux/types";

// export interface Notification {
//   _id: string;
//   userId: string;
//   type: "message" | "incoming_call" | "missed_call" | "task_reminder" | 'new_user' | 'new_mentor' | 'mentor_approved' | 'collaboration_status';
//   content: string;
//   relatedId: string;
//   status: "unread" | "read";
//   callId?: string;
//   callType?: "audio" | "video";
//   senderId: string;
//   createdAt: string;
//   updatedAt: string;
//   taskContext?: {
//     contextType: "user" | "group" | "collaboration" ;
//     contextId: string;
//   };
// }

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

export interface GroupCallData {
  groupId: string;
  type: "group";
  callId: string;
  callType: "audio" | "video";
  senderId?: string;
}

export interface GroupOfferData extends GroupCallData {
  senderId: string;
  recipientId: string;
  offer: RTCSessionDescriptionInit;
  senderName?: string;
}

export interface GroupAnswerData extends GroupCallData {
  senderId: string;
  recipientId: string;
  answer: RTCSessionDescriptionInit;
}

export interface GroupIceCandidateData extends GroupCallData {
  senderId: string;
  recipientId: string;
  candidate: RTCIceCandidateInit;
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
    _id:string;
    day: string;
    timeSlots: string[];
  }[];
  profilePic: string;
  coverPic: string;
  startDate: string; 
  adminId: User;
  members: {
    _id:string;
    userId: User;
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


export interface ICallLog {
  _id: string;
  CallId: string;
  chatKey: string;
  callType: "audio" | "video";
  type: "group" | "user-mentor" | "user-user";
  senderId: {
    _id: string ;
    name: string;
    profilePic: string | null;
  };
  recipientIds: {
    _id: string;
    name: string;
    profilePic: string | null;
  }[];
  groupId?: string;
  status: "ongoing" | "completed" | "missed";
  callerName?: string; 
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}