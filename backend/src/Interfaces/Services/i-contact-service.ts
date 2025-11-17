import { FormattedContact } from "../../Utils/types/contact-types";

export interface IContactService {
  getUserContacts: (userId?: string) => Promise<FormattedContact[]>;
}