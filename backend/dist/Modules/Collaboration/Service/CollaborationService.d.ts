import { BaseService } from "../../../core/Services/BaseService.js";
import { ICollaboration } from "../../../Interfaces/models/ICollaboration.js";
import { IMentorRequest } from "../../../Interfaces/models/IMentorRequest.js";
import { LockedSlot } from "../Types/types.js";
export declare class CollaborationService extends BaseService {
    private collabRepo;
    private contactRepo;
    private mentorRepo;
    constructor();
    TemporaryRequestService: (requestData: Partial<IMentorRequest>) => Promise<IMentorRequest>;
    getMentorRequests: (mentorId: string) => Promise<IMentorRequest[]>;
    acceptRequest: (requestId: string) => Promise<IMentorRequest | null>;
    rejectRequest: (requestId: string) => Promise<IMentorRequest | null>;
    getRequestForUser: (userId: string) => Promise<IMentorRequest[]>;
    processPaymentService: (paymentMethodId: string, amount: number, requestId: string, mentorRequestData: Partial<IMentorRequest>, email: string, returnUrl: string) => Promise<{
        paymentIntent: any;
        contacts?: any[];
    }>;
    getCollabDataForUserService: (userId: string) => Promise<ICollaboration[]>;
    getCollabDataForMentorService: (mentorId: string) => Promise<ICollaboration[]>;
    removeCollab: (collabId: string, reason: string) => Promise<ICollaboration | null>;
    getMentorRequestsService: ({ page, limit, search, }: {
        page: number;
        limit: number;
        search: string;
    }) => Promise<{
        requests: IMentorRequest[];
        total: number;
        page: number;
        pages: number;
    }>;
    getCollabsService: ({ page, limit, search, }: {
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
    markUnavailableDaysService: (collabId: string, updateData: {
        datesAndReasons: {
            date: Date;
            reason: string;
        }[];
        requestedBy: "user" | "mentor";
        requesterId: string;
        approvedById: string;
        isApproved: "pending" | "approved" | "rejected";
    }) => Promise<ICollaboration | null>;
    updateTemporarySlotChangesService: (collabId: string, updateData: {
        datesAndNewSlots: {
            date: Date;
            newTimeSlots: string[];
        }[];
        requestedBy: "user" | "mentor";
        requesterId: string;
        approvedById: string;
        isApproved: "pending" | "approved" | "rejected";
    }) => Promise<ICollaboration | null>;
    processTimeSlotRequest: (collabId: string, requestId: string, isApproved: boolean, requestType: "unavailable" | "timeSlot") => Promise<ICollaboration | null>;
    getMentorLockedSlots: (mentorId: string) => Promise<LockedSlot[]>;
    private calculateNewEndDate;
}
//# sourceMappingURL=CollaborationService.d.ts.map