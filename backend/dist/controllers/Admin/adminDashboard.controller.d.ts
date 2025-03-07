import { Request, Response } from "express";
declare class AdminController {
    getTotalUsersCount(_req: Request, res: Response): Promise<void>;
    getTotalMentorsCount(_req: Request, res: Response): Promise<void>;
    getTotalRevenue(_req: Request, res: Response): Promise<void>;
    getPendingMentorRequestsCount(_req: Request, res: Response): Promise<void>;
    getActiveCollaborationsCount(_req: Request, res: Response): Promise<void>;
    getRevenueTrends(req: Request, res: Response): Promise<void>;
    getUserGrowth(req: Request, res: Response): Promise<void>;
    getPendingMentorRequests(req: Request, res: Response): Promise<void>;
    getTopMentors(req: Request, res: Response): Promise<void>;
    getRecentCollaborations(req: Request, res: Response): Promise<void>;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=adminDashboard.controller.d.ts.map