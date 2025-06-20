import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
export declare class CollaborationController extends BaseController {
    private collabService;
    constructor();
    TemporaryRequestController: (req: Request, res: Response) => Promise<void>;
    getMentorRequestsController: (req: Request, res: Response) => Promise<void>;
    acceptRequestController: (req: Request, res: Response) => Promise<void>;
    rejectRequestController: (req: Request, res: Response) => Promise<void>;
    getRequestForUserController: (req: Request, res: Response) => Promise<void>;
    makeStripePaymentController: (req: Request, res: Response) => Promise<void>;
    getCollabDataForUserController: (req: Request, res: Response) => Promise<void>;
    getCollabDataForMentorController: (req: Request, res: Response) => Promise<void>;
    deleteCollab: (req: Request, res: Response) => Promise<void>;
    getAllMentorRequests: (req: Request, res: Response) => Promise<void>;
    getAllCollabs: (req: Request, res: Response) => Promise<void>;
    getCollabDetailsByCollabId: (req: Request, res: Response) => Promise<void>;
    getRequestDetailsByRequestId: (req: Request, res: Response) => Promise<void>;
    markUnavailableDays: (req: Request, res: Response) => Promise<void>;
    updateTemporarySlotChanges: (req: Request, res: Response) => Promise<void>;
    approveTimeSlotRequest: (req: Request, res: Response) => Promise<void>;
    getMentorLockedSlotsController: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CollaborationController.d.ts.map