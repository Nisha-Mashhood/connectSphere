declare class AdminService {
    getTotalUsersCount(): Promise<number>;
    getTotalMentorsCount(): Promise<number>;
    getTotalRevenue(): Promise<{
        totalRevenue: any;
        platformProfit: number;
    }>;
    getPendingMentorRequestsCount(): Promise<number>;
    getActiveCollaborationsCount(): Promise<number>;
    getRevenueTrends(timeFormat: string, days: number): Promise<{
        name: any;
        totalRevenue: any;
        platformRevenue: number;
        mentorRevenue: number;
    }[]>;
    getUserGrowth(timeFormat: string, days: number): Promise<{
        name: string;
        users: number;
        mentors: number;
    }[]>;
    getPendingMentorRequests(limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../../models/mentor.model.js").IMentor> & import("../../models/mentor.model.js").IMentor & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getTopMentors(limit: number): Promise<any[]>;
    getRecentCollaborations(limit: number): Promise<(import("mongoose").Document<unknown, {}, import("../../models/collaboration.js").ICollaboration> & import("../../models/collaboration.js").ICollaboration & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=adminDashoard.service.d.ts.map