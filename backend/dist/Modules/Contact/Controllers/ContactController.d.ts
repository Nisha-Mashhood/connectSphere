import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
export declare class ContactController extends BaseController {
    private contactService;
    constructor();
    getUserContacts(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ContactController.d.ts.map