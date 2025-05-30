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
        jobTitle?: string;
    };
    targetUserId?: {
        _id: string;
        name?: string;
        profilePic?: string;
        jobTitle?: string;
    };
    collaborationId?: {
        _id: string;
        mentorId: {
            userId: {
                _id: string;
                name?: string;
                profilePic?: string;
                jobTitle?: string;
            };
        };
        userId: {
            _id: string;
            name?: string;
            profilePic?: string;
            jobTitle?: string;
        };
        startDate: Date;
        endDate?: Date;
        price: number;
        selectedSlot: {
            day: string;
            timeSlots: string[];
        }[];
    };
    userConnectionId?: {
        _id: string;
        requester: {
            _id: string;
            name?: string;
            profilePic?: string;
            jobTitle?: string;
        };
        recipient: {
            _id: string;
            name?: string;
            profilePic?: string;
            jobTitle?: string;
        };
        requestAcceptedAt?: Date;
    };
    groupId?: {
        _id: string;
        name?: string;
        profilePic?: string;
        startDate: Date;
        adminId: {
            _id: string;
            name?: string;
            profilePic?: string;
        };
        bio: string;
        price: number;
        maxMembers: number;
        availableSlots: {
            day: string;
            timeSlots: string[];
        }[];
        members: {
            userId: {
                _id: string;
                name?: string;
                profilePic?: string;
            };
            joinedAt: Date;
        }[];
    };
    type: "user-mentor" | "user-user" | "group";
    createdAt: Date;
    updatedAt: Date;
}
export declare const findContactsByUserId: (userId: string) => Promise<PopulatedContact[]>;
//# sourceMappingURL=contacts.repository.d.ts.map