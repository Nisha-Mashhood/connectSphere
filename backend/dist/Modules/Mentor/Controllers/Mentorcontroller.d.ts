import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
export declare class MentorController extends BaseController {
    private mentorService;
    private authService;
    private userRepo;
    constructor();
    checkMentorStatus: (req: Request, res: Response) => Promise<void>;
    getMentorDetails: (req: Request, res: Response) => Promise<void>;
    createMentor: (req: Request, res: Response) => Promise<void>;
    getAllMentorRequests: (req: Request, res: Response) => Promise<void>;
    getAllMentors: (_req: Request, res: Response) => Promise<void>;
    getMentorByUserId: (req: Request, res: Response) => Promise<void>;
    approveMentorRequest: (req: Request, res: Response) => Promise<void>;
    rejectMentorRequest: (req: Request, res: Response) => Promise<void>;
    cancelMentorship: (req: Request, res: Response) => Promise<void>;
    updateMentorProfile: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=Mentorcontroller.d.ts.map