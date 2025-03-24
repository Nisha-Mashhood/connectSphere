import { IContact } from "../models/contacts.model.js";
export declare const createContact: (contactData: Partial<IContact>) => Promise<IContact>;
export declare const createContactsForCollaboration: (userId: string, mentorUserId: string, collaborationId: string) => Promise<IContact[]>;
//# sourceMappingURL=contacts.repository.d.ts.map