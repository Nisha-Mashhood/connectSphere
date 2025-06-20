import { Request, Response } from 'express';
export declare class UserConnectionController {
    private userConnectionService;
    constructor();
    sendRequest: (req: Request, res: Response) => Promise<void>;
    respondToRequest: (req: Request, res: Response) => Promise<void>;
    disconnectConnection: (req: Request, res: Response) => Promise<void>;
    getUserConnections: (req: Request, res: Response) => Promise<void>;
    getUserRequests: (req: Request, res: Response) => Promise<void>;
    getAllUserConnections: (_req: Request, res: Response) => Promise<void>;
    getUserConnectionById: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=userCollaborationController.d.ts.map