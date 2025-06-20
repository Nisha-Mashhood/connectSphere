import { BaseService } from '../../../core/Services/BaseService.js';
import { IContactMessage } from '../../../Interfaces/models/IContactMessage.js';
export declare class ContactMessageService extends BaseService {
    private contactMessageRepo;
    constructor();
    createContactMessage: (data: {
        name: string;
        email: string;
        message: string;
    }) => Promise<IContactMessage>;
    getAllContactMessages: () => Promise<IContactMessage[]>;
    sendReply: (contactMessageId: string, replyData: {
        email: string;
        replyMessage: string;
    }) => Promise<IContactMessage>;
}
//# sourceMappingURL=ContactUsService.d.ts.map