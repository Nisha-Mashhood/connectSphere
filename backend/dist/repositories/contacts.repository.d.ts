import { IContact } from "../models/contacts.model.js";
import mongoose from "mongoose";
export declare const createContact: (contactData: Partial<IContact>) => Promise<IContact>;
export declare const findContactById: (contactId: string) => Promise<IContact | null>;
export declare const findContactByUsers: (userId: string, targetUserId: string) => Promise<IContact | null>;
export interface PopulatedContact {
    _id: string | mongoose.Types.ObjectId;
    contactId: string;
    userId: {
        _id: string;
        name?: string;
        profilePic?: string;
    };
    targetUserId?: {
        _id: string;
        name?: string;
        profilePic?: string;
    };
    collaborationId?: {
        _id: string;
        mentorId: {
            userId: {
                _id: string;
                name?: string;
                profilePic?: string;
            };
        };
        userId: {
            _id: string;
            name?: string;
            profilePic?: string;
        };
    };
    userConnectionId?: {
        _id: string;
        requester: {
            _id: string;
            name?: string;
            profilePic?: string;
        };
        recipient: {
            _id: string;
            name?: string;
            profilePic?: string;
        };
    };
    groupId?: {
        _id: string;
        name?: string;
        profilePic?: string;
    };
    type: "user-mentor" | "user-user" | "group";
    createdAt: Date;
    updatedAt: Date;
}
export declare const findContactsByUserId: (userId: string) => Promise<PopulatedContact[]>;
//# sourceMappingURL=contacts.repository.d.ts.map