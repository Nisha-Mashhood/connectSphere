import { BaseService } from '../../../core/Services/BaseService.js';
import { FormattedContact } from '../Types/types.js';
export declare class ContactService extends BaseService {
    private contactRepo;
    constructor();
    getUserContacts: (userId?: string) => Promise<FormattedContact[]>;
}
//# sourceMappingURL=ContactService.d.ts.map