import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IContactMessage } from '../../../Interfaces/models/IContactMessage.js';
export declare class ContactMessageRepository extends BaseRepository<IContactMessage> {
    constructor();
    createContactMessage(data: {
        name: string;
        email: string;
        message: string;
    }): Promise<IContactMessage>;
    getAllContactMessages(): Promise<IContactMessage[]>;
    updateReplyStatus(contactMessageId: string): Promise<IContactMessage>;
}
//# sourceMappingURL=ContactUsRepositry.d.ts.map