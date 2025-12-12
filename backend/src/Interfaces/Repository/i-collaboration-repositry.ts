import { UserIds } from "../../Utils/types/notification-types";
import { ICollaboration } from "../Models/i-collaboration";
import { IMentorRequest } from "../Models/i-mentor-request";
import { LockedSlot } from "../../Utils/types/collaboration-types";
import { ClientSession } from "mongoose";

export interface ICollaborationRepository {
  findById(id: string): Promise<ICollaboration | null>;
  createTemporaryRequest(data: Partial<IMentorRequest>): Promise<IMentorRequest>;
  getMentorRequestsByMentorId(mentorId: string): Promise<IMentorRequest[]>;
  findMentorRequestById(id: string): Promise<IMentorRequest | null>;
  updateMentorRequestStatus(id: string, status?: string | "Pending"): Promise<IMentorRequest | null>;
  getRequestByUserId(userId: string): Promise<IMentorRequest[]>;
  createCollaboration(collaborationData: Partial<ICollaboration>, session?: ClientSession): Promise<ICollaboration>;
  deleteMentorRequest(requestId: string, session?: ClientSession): Promise<void>;
  findCollabById(collabId: string): Promise<ICollaboration | null>;
  deleteCollabById(collabId: string): Promise<ICollaboration | null>;
  markCollabAsCancelled(collabId: string): Promise<ICollaboration | null>;
  updateCollabFeedback(collabId: string): Promise<ICollaboration | null>;
  getCollabDataForUser(userId: string): Promise<ICollaboration[]>;
  getCollabDataForMentor(mentorId: string): Promise<ICollaboration[]>;
  findByIdAndUpdateWithPopulate(id: string, update: Partial<ICollaboration>, options?: { new: boolean; } ): Promise<ICollaboration | null>;
  findMentorRequest(params: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{ requests: IMentorRequest[]; total: number; page: number; pages: number }>;
  findCollab(params: {
    page: number;
    limit: number;
    search: string;
  }): Promise<{ collabs: ICollaboration[]; total: number; page: number; pages: number }>;
  fetchMentorRequestDetails(requestId: string): Promise<IMentorRequest | null>;
  findCollabDetails(collabId: string): Promise<ICollaboration | null>;
  updateUnavailableDays(
    collabId: string,
    updateData: {
      datesAndReasons: { date: Date; reason: string }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null>;
  updateTemporarySlotChanges(
    collabId: string,
    updateData: {
      datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
      requestedBy: "user" | "mentor";
      requesterId: string;
      approvedById: string;
      isApproved: "pending" | "approved" | "rejected";
    }
  ): Promise<ICollaboration | null>;
  updateRequestStatus(
    collabId: string,
    requestId: string,
    requestType: "unavailable" | "timeSlot",
    status: "approved" | "rejected",
    newEndDate?: Date
  ): Promise<ICollaboration | null>;
  getLockedSlotsByMentorId(mentorId: string): Promise<LockedSlot[]>;
  findByMentorId(mentorId: string): Promise<ICollaboration[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ICollaboration[]>;
  findByIdAndUpdate(id: string, update: Partial<ICollaboration>, options?: { new?: boolean }): Promise<ICollaboration | null>;
  getMentorIdAndUserId(collaborationId: string): Promise<UserIds | null>
}