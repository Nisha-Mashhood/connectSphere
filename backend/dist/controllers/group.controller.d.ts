import { Request, Response } from "express";
export declare const createGroup: (req: Request, res: Response) => Promise<void>;
export declare const getGroupDetails: (req: Request, res: Response) => Promise<void>;
export declare const getGroupDetailsByGroupId: (req: Request, res: Response) => Promise<void>;
export declare const getGroups: (_req: Request, res: Response) => Promise<void>;
export declare const sendGroupRequset: (req: Request, res: Response) => Promise<void>;
export declare const getrequsetDeatilsbyGroupId: (req: Request, res: Response) => Promise<void>;
export declare const getrequsetDeatilsbyAdminId: (req: Request, res: Response) => Promise<void>;
export declare const getrequsetDeatilsbyUserId: (req: Request, res: Response) => Promise<void>;
export declare const updaterequsetDeatils: (req: Request, res: Response) => Promise<void>;
export declare const makeStripePaymentController: (req: Request, res: Response) => Promise<void>;
export declare const removeGroupMember: (req: Request, res: Response) => Promise<void>;
export declare const deleteGroup: (req: Request, res: Response) => Promise<void>;
export declare const updateGroupImage: (req: Request, res: Response) => Promise<void>;
export declare const fetchGroupDetailsForMembers: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=group.controller.d.ts.map