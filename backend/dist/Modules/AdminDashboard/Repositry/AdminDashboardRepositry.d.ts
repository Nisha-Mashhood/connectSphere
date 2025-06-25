declare class AdminRepository {
    getTotalUsersCount: () => Promise<number>;
    getTotalMentorsCount: () => Promise<number>;
    getTotalRevenue: () => Promise<{
        totalRevenue: any;
        platformProfit: number;
    }>;
    getPendingMentorRequestsCount: () => Promise<number>;
    getActiveCollaborationsCount: () => Promise<number>;
    getRevenueTrends: (timeFormat: string, days: number) => Promise<{
        name: any;
        totalRevenue: any;
        platformRevenue: number;
        mentorRevenue: number;
    }[]>;
    getUserGrowth: (timeFormat: string, days: number) => Promise<{
        name: string;
        users: number;
        mentors: number;
    }[]>;
    getPendingMentorRequests: (limit?: number) => Promise<(import("mongoose").Document<unknown, {}, import("../../../Interfaces/models/IMentor.js").IMentor> & import("../../../Interfaces/models/IMentor.js").IMentor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTopMentors: (limit: number) => Promise<any[]>;
    getRecentCollaborations: (limit: number) => Promise<(import("mongoose").Document<unknown, {}, import("../../../Interfaces/models/ICollaboration.js").ICollaboration> & import("../../../Interfaces/models/ICollaboration.js").ICollaboration & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
declare const _default: AdminRepository;
export default _default;
//# sourceMappingURL=AdminDashboardRepositry.d.ts.map