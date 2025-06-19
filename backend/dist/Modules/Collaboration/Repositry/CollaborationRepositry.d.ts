import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { ICollaboration } from '../../../Interfaces/models/ICollaboration.js';
import { IMentorRequest } from '../../../Interfaces/models/IMentorRequest.js';
export interface LockedSlot {
    day: string;
    timeSlots: string[];
}
export declare class CollaborationRepository extends BaseRepository<ICollaboration> {
    private mentorRequestModel;
    constructor();
    private toObjectId;
    createTemporaryRequest(data: Partial<IMentorRequest>): Promise<IMentorRequest>;
    getMentorRequestsByMentorId(mentorId: string): Promise<IMentorRequest[]>;
    findMentorRequestById(id: string): Promise<IMentorRequest | null>;
    updateMentorRequestStatus(id: string, status: string): Promise<IMentorRequest | null>;
    getRequestByUserId(userId: string): Promise<IMentorRequest[]>;
    createCollaboration(collaborationData: Partial<ICollaboration>): Promise<ICollaboration>;
    deleteMentorRequest(requestId: string): Promise<void>;
    findCollabById(collabId: string): Promise<ICollaboration | null>;
    deleteCollabById(collabId: string): Promise<ICollaboration | null>;
    markCollabAsCancelled(collabId: string): Promise<ICollaboration | null>;
    updateCollabFeedback(collabId: string): Promise<ICollaboration | null>;
    getCollabDataForUser(userId: string): Promise<ICollaboration[]>;
    getCollabDataForMentor(mentorId: string): Promise<ICollaboration[]>;
    findMentorRequest({ page, limit, search }: {
        page: number;
        limit: number;
        search: string;
    }): Promise<{
        requests: IMentorRequest[];
        total: number;
        page: number;
        pages: number;
    }>;
    findCollab({ page, limit, search }: {
        page: number;
        limit: number;
        search: string;
    }): Promise<{
        collabs: ICollaboration[];
        total: number;
        page: number;
        pages: number;
    }>;
    fetchMentorRequestDetails(requestId: string): Promise<IMentorRequest | null>;
    findCollabDetails(collabId: string): Promise<ICollaboration | null>;
    updateUnavailableDays(collabId: string, updateData: {
        datesAndReasons: {
            date: Date;
            reason: string;
        }[];
        requestedBy: 'user' | 'mentor';
        requesterId: string;
        approvedById: string;
        isApproved: 'pending' | 'approved' | 'rejected';
    }): Promise<ICollaboration | null>;
    updateTemporarySlotChanges(collabId: string, updateData: {
        datesAndNewSlots: {
            date: Date;
            newTimeSlots: string[];
        }[];
        requestedBy: 'user' | 'mentor';
        requesterId: string;
        approvedById: string;
        isApproved: 'pending' | 'approved' | 'rejected';
    }): Promise<ICollaboration | null>;
    updateRequestStatus(collabId: string, requestId: string, requestType: 'unavailable' | 'timeSlot', status: 'approved' | 'rejected', newEndDate?: Date): Promise<ICollaboration | null>;
    getLockedSlotsByMentorId(mentorId: string): Promise<LockedSlot[]>;
}
//# sourceMappingURL=CollaborationRepositry.d.ts.map