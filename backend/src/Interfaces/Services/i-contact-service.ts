import { FormattedContact } from "../../Utils/Types/contact-types";

export interface IContactService {
  getUserContacts: (userId?: string) => Promise<FormattedContact[]>;
}