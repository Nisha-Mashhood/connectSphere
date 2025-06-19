import { IContactMessage } from "../Interfaces/models/IContactMessage.js";
export declare const createContactMessage: (data: {
    name: string;
    email: string;
    message: string;
}) => Promise<IContactMessage>;
export declare const getAllContactMessages: () => Promise<IContactMessage[]>;
export declare const sendReply: (contactMessageId: string, replyData: {
    email: string;
    replyMessage: string;
}) => Promise<IContactMessage>;
//# sourceMappingURL=contactUs.service.d.ts.map