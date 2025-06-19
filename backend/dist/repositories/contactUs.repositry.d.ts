import { IContactMessage } from "../Interfaces/models/IContactMessage.js";
export declare const createContactMessage: (data: {
    name: string;
    email: string;
    message: string;
}) => Promise<IContactMessage>;
export declare const getAllContactMessages: () => Promise<IContactMessage[]>;
export declare const updateReplyStatus: (contactMessageId: string) => Promise<IContactMessage>;
//# sourceMappingURL=contactUs.repositry.d.ts.map