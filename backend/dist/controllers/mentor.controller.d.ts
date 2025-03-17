import { Request, Response } from "express";
export declare const checkMentorStatus: (req: Request, res: Response) => Promise<void>;
export declare const getMentorDetails: (req: Request, res: Response) => Promise<void>;
export declare const createMentor: (req: Request, res: Response) => Promise<void>;
export declare const getAllMentorRequests: (req: Request, res: Response) => Promise<void>;
export declare const getAllMentors: (_req: Request, res: Response) => Promise<void>;
export declare const getMentorByUserId: (req: Request, res: Response) => Promise<void>;
export declare const approveMentorRequest: (req: Request, res: Response) => Promise<void>;
export declare const rejectMentorRequest: (req: Request, res: Response) => Promise<void>;
export declare const cancelMentorship: (req: Request, res: Response) => Promise<void>;
export declare const updateMentorProfile: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=mentor.controller.d.ts.map