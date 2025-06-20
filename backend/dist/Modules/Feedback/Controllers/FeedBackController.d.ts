import { Request, Response } from 'express';
export declare class FeedbackController {
    private feedbackService;
    constructor();
    createFeedback: (req: Request, res: Response) => Promise<void>;
    getMentorFeedbacks: (req: Request, res: Response) => Promise<void>;
    getUserFeedbacks: (req: Request, res: Response) => Promise<void>;
    getFeedbackForProfile: (req: Request, res: Response) => Promise<void>;
    getFeedbackByCollaborationId: (req: Request, res: Response) => Promise<void>;
    toggleFeedback: (req: Request, res: Response) => Promise<void>;
    getFeedbackByMentorId: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=FeedBackController.d.ts.map