import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IContact } from '../../../Interfaces/models/IContact.js';
import { PopulatedContact } from '../Types/types.js';
export declare class ContactRepository extends BaseRepository<IContact> {
    constructor();
    private toObjectId;
    createContact: (contactData: Partial<IContact>) => Promise<IContact>;
    findContactById: (contactId: string) => Promise<IContact | null>;
    findContactByUsers: (userId: string, targetUserId: string) => Promise<IContact | null>;
    findContactsByUserId: (userId?: string) => Promise<PopulatedContact[]>;
}
//# sourceMappingURL=ContactRepositry.d.ts.map