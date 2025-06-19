import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { IMentor } from "../../../Interfaces/models/IMentor.js";
export declare class MentorRepository extends BaseRepository<IMentor> {
    constructor();
    private toObjectId;
    submitMentorRequest(data: Partial<IMentor>): Promise<IMentor>;
    getAllMentorRequests(page?: number, limit?: number, search?: string, status?: string, sort?: string): Promise<{
        mentors: IMentor[];
        total: number;
        page: number;
        pages: number;
    }>;
    getAllMentors(): Promise<IMentor[]>;
    getMentorDetails(id: string): Promise<IMentor | null>;
    approveMentorRequest(id: string): Promise<IMentor | null>;
    rejectMentorRequest(id: string): Promise<IMentor | null>;
    cancelMentorship(id: string): Promise<IMentor | null>;
    getMentorById(id: string): Promise<IMentor | null>;
    getMentorByUserId(userId: string): Promise<IMentor | null>;
    updateMentorById(mentorId: string, updateData: Partial<IMentor>): Promise<IMentor | null>;
    saveMentorRequest(data: Partial<IMentor>): Promise<IMentor>;
}
//# sourceMappingURL=MentorRepositry.d.ts.map