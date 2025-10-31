// User type
export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  coverPic?: string;
  profilePic?: string;
  industry?: string;
  jobTitle?: string;
  reasonForJoining?: string;
  hasReviewed?: boolean;
  loginCount?: number;
  role?: 'mentor' | 'user';
}

//Complete user Details
export interface CompleteMentorDetails {
  id: string;
  mentorId?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  skills: {
    _id: string;
    name: string;
    subcategoryId: string;
  }[];
  categories?: {
    name: string;
  }[];
  isApproved?: string;
  rejectionReason?: string;
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots: { _id: string; day: string; timeSlots: string[] }[];
  timePeriod?: number;
  avgRating: number;
  feedbackCount: number;
  createdAt: Date;
  updatedAt: Date;
}


// Mentor type
export interface Mentor {
  id: string;
  mentorId: string;
  userId: string;
  user: User;
  bio: string;
  certifications: string[];
  skills: string[];
  skillsDetails: { id?: string; name: string, categoryId?: string, subcategoryId?: string; }[];
  availableSlots: { _id?: string; day: string; timeSlots: string[] }[];
  specialization: string;
  price: number;
  timePeriod: number;
  isApproved: 'Pending' | 'Completed' | 'Rejected';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Collaboration data 
export interface UnavailableDay {
  id: string;
  datesAndReasons: { date: string; reason: string }[];
  requestedBy: 'user' | 'mentor';
  requesterId: string;
  isApproved: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
}

export interface TemporarySlotChange {
  id: string;
  datesAndNewSlots: { date: string; newTimeSlots: string[] }[];
  requestedBy: 'user' | 'mentor';
  requesterId: string;
  isApproved: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
}

export interface CollabData {
  id: string;
  collaborationId: string;
  mentorId: string;
  userId: string;
  mentor: Mentor;
  user: User;
  selectedSlot: { day: string; timeSlots: string[] }[];
  unavailableDays: UnavailableDay[];
  temporarySlotChanges: TemporarySlotChange[];
  payment: boolean;
  paymentIntentId: string | null;
  isCancelled: boolean;
  isCompleted: boolean;
  price: number;
  startDate: string;
  endDate: string;
  feedbackGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollabDetails {
  type: 'mentor' | 'user';
  data: CollabData[];
}

// Request data
export interface RequestData {
  id: string;
  mentorRequestId: string;
  mentorId: string,
  mentor: Mentor
  userId:string;
  user: User;
  selectedSlot: { day: string; timeSlots: string } | null;
  price: number;
  timePeriod: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  isAccepted: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

// Request
export interface Request {
  receivedRequests: RequestData[];
  sentRequests: RequestData[];
}

// Group 
export interface Group {
  id: string;
  groupId: string;
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  members: { userId: string; joinedAt: string }[];
  membersDetails: GroupMemberDetail[];
  admin: User | null;
  adminId: string;
  availableSlots: { id?:string, day: string; timeSlots: string[] }[];
  coverPic: string;
  profilePic: string;
  startDate: string | null;
  isFull: boolean;
  createdAt: string;
}

// GroupMembership
export interface GroupMembership {
  id: string;
  groupId: string;
  name: string;
  bio: string;
  price: number;
  startDate: string | null;
  admin: User | null;
  adminId: string;
  availableSlots: { day: string; timeSlots: string[] }[];
  coverPic: string;
  profilePic: string;
  isFull: boolean;
  maxMembers: number;
  members: { userId: string; joinedAt: string }[];
  membersDetails: GroupMemberDetail[];
  createdAt: string;
}

export interface GroupMemberDetail {
  joinedAt: string;
  user: User;
}

// GroupMemberships 
export interface GroupMemberships {
  groups: GroupMembership[];
}

export interface GroupRequests {
  id: string;
  groupRequestId: string;
  groupId: string; 
  group: Group;   
  userId: string;
  user: User;
  status: "Pending" | "Accepted" | "Rejected";
  paymentStatus: "Pending" | "Paid" | "Failed";
  amountPaid: number;
  paymentId: string | null;
  createdAt: string;
}

// GroupRequest
export interface GroupRequest {
  id: string;
  groupId: { id: string; adminId: string; name?: string };
  userId: { id: string; name?: string };
  status: 'Pending' | 'Accepted' | 'Rejected';
  paymentStatus: string;
}

// UserConnection
export interface UserConnection {
  id: string;
  connectionId: string;
  requesterId: string;
  recipientId: string;
  requester: User;
  recipient: User;
  requestStatus: 'Pending' | 'Accepted' | 'Rejected';
  connectionStatus: 'Connected' | 'Disconnected';
  requestSentAt: string;
  requestAcceptedAt?: string;
  disconnectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUserRequestsResponse {
  receivedRequests: UserConnection[];
  sentRequests: UserConnection[];
}

export type UserConnections = {
  sent: UserConnection[];
  received: UserConnection[];
};

// ProfileState
export interface ProfileState {
  mentorDetails: Mentor | null;
  collabDetails: CollabDetails | null;
  req: Request;
  Groups: Group[];
  groupRequests: GroupRequest[];
  groupMemberships: GroupMemberships;
  userConnections: {
    sent: UserConnection[];
    received: UserConnection[];
  };
  loading: boolean;
  error: string | null;
}

export interface FetchCollabDetailsArgs {
  userId: string;
  role: 'mentor' | 'user';
  mentorId?: string;
}

export interface FetchCollabDetailsResponse {
  role: 'mentor' | 'user';
  data: CollabData[];
}

export interface FetchRequestsArgs {
  userId: string;
  role: 'mentor' | 'user';
  mentorId?: string;
}

export interface FetchRequestsResponse {
  receivedRequests: RequestData[];
  sentRequests: RequestData[];
}

export interface Category {
  id: string;
  categoryId?: string; 
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
}

export interface LockedSlot {
  day: string;
  timeSlots: string[];
}

export interface Feedback {
  id: string;
  feedbackId: string;
  userId: string; 
  user?: User;
  mentorId: string; 
  mentor?: Mentor;
  collaborationId: string;
  collaboration?: CollabDetails; 
  givenBy: "user" | "mentor";
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  isHidden: boolean;
  createdAt: Date;
}