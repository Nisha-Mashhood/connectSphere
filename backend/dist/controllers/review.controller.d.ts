import { Request, Response } from "express";
export declare const submitReview: (req: Request, res: Response) => Promise<void>;
export declare const skipReview: (req: Request, res: Response) => Promise<void>;
export declare const getAllReviews: (_req: Request, res: Response) => Promise<void>;
export declare const approveReview: (req: Request, res: Response) => Promise<void>;
export declare const selectReview: (req: Request, res: Response) => Promise<void>;
export declare const getSelectedReviews: (_req: Request, res: Response) => Promise<void>;
export declare const cancelApproval: (req: Request, res: Response) => Promise<void>;
export declare const deselectReview: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map