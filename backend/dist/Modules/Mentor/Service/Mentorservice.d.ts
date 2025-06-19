import { BaseService } from "../../../core/Services/BaseService.js";
import { IMentor } from "../../../Interfaces/models/IMentor.js";
export declare class MentorService extends BaseService {
    private mentorRepo;
    private authRepo;
    constructor();
    submitMentorRequest(mentorData: {
        userId: string;
        skills: string[];
        specialization: string;
        bio: string;
        price: number;
        availableSlots: object[];
        timePeriod: number;
        certifications: string[];
    }): Promise<IMentor>;
    getAllMentorRequests(page?: number, limit?: number, search?: string, status?: string, sort?: string): Promise<{
        mentors: IMentor[];
        total: number;
        page: number;
        pages: number;
    }>;
    getAllMentors(): Promise<IMentor[]>;
    getMentorByMentorId(mentorId: string): Promise<IMentor | null>;
    approveMentorRequest(id: string): Promise<void>;
    rejectMentorRequest(id: string, reason: string): Promise<void>;
    cancelMentorship(id: string): Promise<void>;
    getMentorByUserId(userId: string): Promise<IMentor | null>;
    updateMentorById(mentorId: string, updateData: Partial<IMentor>): Promise<IMentor | null>;
}
//# sourceMappingURL=Mentorservice.d.ts.map