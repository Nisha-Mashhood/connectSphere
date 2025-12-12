import { Types } from "mongoose";
import { IMentorRequest } from "../Models/i-mentor-request";
import { LockedSlot } from "../../Utils/types/collaboration-types";
import { IMentorRequestDTO } from "../DTOs/i-mentor-request-dto";
import { ICollaborationDTO } from "../DTOs/i-collaboration-dto";

export interface ICollaborationService {
  TemporaryRequestService: (requestData: Partial<IMentorRequest>) => Promise<IMentorRequestDTO | null>;
  getMentorRequests: (mentorId: string) => Promise<IMentorRequestDTO[]>;
  acceptRequest: (requestId: string) => Promise<IMentorRequestDTO | null>;
  rejectRequest: (requestId: string) => Promise<IMentorRequestDTO | null>;
  getRequestForUser: (userId: string) => Promise<IMentorRequestDTO[]>;
  processPaymentService: (
    paymentMethodId: string,
    amount: number,
    requestId: string,
    mentorRequestData: Partial<IMentorRequest>,
    email: string,
    returnUrl: string
  ) => Promise<{ paymentIntent: any; contacts?: any[] }>;
  getCollabDataForUserService: (userId: string, includeCompleted: boolean) => Promise<ICollaborationDTO[]>;
  getCollabDataForMentorService: (mentorId: string, includeCompleted: boolean) => Promise<ICollaborationDTO[]>;
  cancelAndRefundCollab: (collabId: string, reason: string, amount: number) => Promise<ICollaborationDTO | null>;
  getMentorRequestsService: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{
    requests: IMentorRequestDTO[];
    total: number;
    page: number;
    pages: number;
  }>;
  getCollabsService: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{
    collabs: ICollaborationDTO[];
    total: number;
    page: number;
    pages: number;
  }>;
  fetchCollabById: (collabId: string) => Promise<ICollaborationDTO | null>;
  fetchRequestById: (requestId: string) => Promise<IMentorRequestDTO | null>;
  markUnavailableDaysService: (
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ) => Promise<ICollaborationDTO | null>;
  updateTemporarySlotChangesService: (
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ) => Promise<ICollaborationDTO | null>;
  processTimeSlotRequest: (
    collabId: string,
    requestId: string,
    isApproved: boolean,
    requestType: "unavailable" | "timeSlot"
  ) => Promise<ICollaborationDTO | null>;
  getMentorLockedSlots: (mentorId: string) => Promise<LockedSlot[]>;
  getReceiptData: (collabId: string) => Promise<{
    mentorUser: { name: string; email: string };
    user: { name: string; email: string; _id: Types.ObjectId };
    paymentIntent: any;
    collab: ICollaborationDTO;
  }>;
  generateReceiptPDF: (collabId: string) => Promise<Buffer>;
  deleteMentorRequestService(requestId: string): Promise<void>;
}