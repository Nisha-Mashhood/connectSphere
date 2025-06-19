import { BaseService } from '../../../core/Services/BaseService.js';
import { IChatMessage } from '../../../Interfaces/models/IChatMessage.js';
export declare class ChatService extends BaseService {
    private chatRepo;
    private contactRepo;
    constructor();
    getChatMessages(contactId?: string, groupId?: string, page?: number, limit?: number): Promise<{
        messages: IChatMessage[];
        total: number;
    }>;
    getUnreadMessageCounts(userId: string): Promise<{
        [key: string]: number;
    }>;
}
//# sourceMappingURL=ChatService.d.ts.map