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
<<<<<<< HEAD
        jobTitle?: string;
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    };
    targetUserId?: {
        _id: string;
        name?: string;
        profilePic?: string;
<<<<<<< HEAD
        jobTitle?: string;
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    };
    collaborationId?: {
        _id: string;
        mentorId: {
            userId: {
                _id: string;
                name?: string;
                profilePic?: string;
<<<<<<< HEAD
                jobTitle?: string;
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
            };
        };
        userId: {
            _id: string;
            name?: string;
            profilePic?: string;
<<<<<<< HEAD
            jobTitle?: string;
        };
        startDate: Date;
        endDate?: Date;
        price: number;
        selectedSlot: {
            day: string;
            timeSlots: string[];
        }[];
=======
        };
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    };
    userConnectionId?: {
        _id: string;
        requester: {
            _id: string;
            name?: string;
            profilePic?: string;
<<<<<<< HEAD
            jobTitle?: string;
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        };
        recipient: {
            _id: string;
            name?: string;
            profilePic?: string;
<<<<<<< HEAD
            jobTitle?: string;
        };
        requestAcceptedAt?: Date;
=======
        };
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    };
    groupId?: {
        _id: string;
        name?: string;
        profilePic?: string;
<<<<<<< HEAD
        startDate: Date;
        adminId: {
            _id: string;
            name?: string;
            profilePic?: string;
        };
        members: {
            userId: {
                _id: string;
                name?: string;
                profilePic?: string;
            };
            joinedAt: Date;
        }[];
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    };
    type: "user-mentor" | "user-user" | "group";
    createdAt: Date;
    updatedAt: Date;
}
export declare const findContactsByUserId: (userId: string) => Promise<PopulatedContact[]>;
//# sourceMappingURL=contacts.repository.d.ts.map