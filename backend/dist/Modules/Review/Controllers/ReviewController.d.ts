import { Request, Response } from 'express';
export declare class ReviewController {
    private reviewService;
    constructor();
    submitReview: (req: Request, res: Response) => Promise<void>;
    skipReview: (req: Request, res: Response) => Promise<void>;
    getAllReviews: (_req: Request, res: Response) => Promise<void>;
    approveReview: (req: Request, res: Response) => Promise<void>;
    selectReview: (req: Request, res: Response) => Promise<void>;
    cancelApproval: (req: Request, res: Response) => Promise<void>;
    deselectReview: (req: Request, res: Response) => Promise<void>;
    getSelectedReviews: (_req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ReviewController.d.ts.map