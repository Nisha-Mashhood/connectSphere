import { Request, Response } from 'express';
export declare class ContactMessageController {
    private contactMessageService;
    constructor();
    createContactMessage(req: Request, res: Response): Promise<void>;
    getAllContactMessages(_req: Request, res: Response): Promise<void>;
    sendReply(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ContactUsController.d.ts.map