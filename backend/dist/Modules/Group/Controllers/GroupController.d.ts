import { Request, Response } from 'express';
export declare class GroupController {
    private groupService;
    constructor();
    createGroup(req: Request, res: Response): Promise<void>;
    getGroupDetails(req: Request, res: Response): Promise<void>;
    getGroupById(req: Request, res: Response): Promise<void>;
    getAllGroups(_req: Request, res: Response): Promise<void>;
    sendGroupRequest(req: Request, res: Response): Promise<void>;
    getGroupRequestsByGroupId(req: Request, res: Response): Promise<void>;
    getGroupRequestsByAdminId(req: Request, res: Response): Promise<void>;
    getGroupRequestsByUserId(req: Request, res: Response): Promise<void>;
    updateGroupRequest(req: Request, res: Response): Promise<void>;
    makeStripePayment(req: Request, res: Response): Promise<void>;
    removeGroupMember(req: Request, res: Response): Promise<void>;
    deleteGroup(req: Request, res: Response): Promise<void>;
    updateGroupImage(req: Request, res: Response): Promise<void>;
    getGroupDetailsForMembers(req: Request, res: Response): Promise<void>;
    getAllGroupRequests(_req: Request, res: Response): Promise<void>;
    getGroupRequestById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=GroupController.d.ts.map