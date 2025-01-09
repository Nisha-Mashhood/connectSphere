import { Request, Response } from "express";
export declare const checkMentorStatus: (req: Request, res: Response) => Promise<void>;
export declare const getSkills: (_: Request, res: Response) => Promise<void>;
export declare const createMentor: (req: Request, res: Response) => Promise<void>;
export declare const getAllMentorRequests: (_req: Request, res: Response) => Promise<void>;
export declare const getMentorByUserId: (req: Request, res: Response) => Promise<void>;
export declare const approveMentorRequest: (req: Request, res: Response) => Promise<void>;
export declare const rejectMentorRequest: (req: Request, res: Response) => Promise<void>;
export declare const cancelMentorship: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=mentor.controller.d.ts.map