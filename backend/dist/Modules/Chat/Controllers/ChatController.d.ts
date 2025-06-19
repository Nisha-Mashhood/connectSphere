import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
export declare class ChatController extends BaseController {
    private chatService;
    private chatRepo;
    constructor();
    getChatMessages(req: Request, res: Response): Promise<void>;
    uploadAndSaveMessage(req: Request, res: Response): Promise<void>;
    getUnreadMessageCounts(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ChatController.d.ts.map