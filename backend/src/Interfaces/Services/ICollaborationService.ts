import { Types } from "mongoose";
import { ICollaboration } from "../../Interfaces/Models/ICollaboration";
import { IMentorRequest } from "../../Interfaces/Models/IMentorRequest";
import { LockedSlot } from "../../Utils/Types/Collaboration.types";

export interface ICollaborationService {
  TemporaryRequestService: (requestData: Partial<IMentorRequest>) => Promise<IMentorRequest>;
  getMentorRequests: (mentorId: string) => Promise<IMentorRequest[]>;
  acceptRequest: (requestId: string) => Promise<IMentorRequest | null>;
  rejectRequest: (requestId: string) => Promise<IMentorRequest | null>;
  getRequestForUser: (userId: string) => Promise<IMentorRequest[]>;
  processPaymentService: (
    paymentMethodId: string,
    amount: number,
    requestId: string,
    mentorRequestData: Partial<IMentorRequest>,
    email: string,
    returnUrl: string
  ) => Promise<{ paymentIntent: any; contacts?: any[] }>;
  getCollabDataForUserService: (userId: string) => Promise<ICollaboration[]>;
  getCollabDataForMentorService: (mentorId: string) => Promise<ICollaboration[]>;
  cancelAndRefundCollab: (collabId: string, reason: string, amount: number) => Promise<ICollaboration | null>;
  getMentorRequestsService: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{
    requests: IMentorRequest[];
    total: number;
    page: number;
    pages: number;
  }>;
  getCollabsService: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{
    collabs: ICollaboration[];
    total: number;
    page: number;
    pages: number;
  }>;
  fetchCollabById: (collabId: string) => Promise<ICollaboration | null>;
  fetchRequestById: (requestId: string) => Promise<IMentorRequest | null>;
  markUnavailableDaysService: (
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ) => Promise<ICollaboration | null>;
  updateTemporarySlotChangesService: (
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ) => Promise<ICollaboration | null>;
  processTimeSlotRequest: (
    collabId: string,
    requestId: string,
    isApproved: boolean,
    requestType: "unavailable" | "timeSlot"
  ) => Promise<ICollaboration | null>;
  getMentorLockedSlots: (mentorId: string) => Promise<LockedSlot[]>;
  getReceiptData: (collabId: string) => Promise<{
    mentorUser: { name: string; email: string };
    user: { name: string; email: string; _id: Types.ObjectId };
    paymentIntent: any;
    collab: ICollaboration;
  }>;
  generateReceiptPDF: (collabId: string) => Promise<Buffer>;
}