interface FormattedContact {
    _id: string;
    contactId: string;
    userId: string;
    targetId: string;
    type: "user-mentor" | "user-user" | "group";
    targetName: string;
    targetProfilePic: string;
    targetJobTitle?: string;
    collaborationId?: string;
    collaborationDetails?: {
        startDate: Date;
        endDate?: Date;
        price: number;
        selectedSlot: {
            day: string;
            timeSlots: string[];
        }[];
        mentorName: string;
        mentorProfilePic: string;
        mentorJobTitle?: string;
        userName: string;
        userProfilePic: string;
        userJobTitle?: string;
    };
    userConnectionId?: string;
    connectionDetails?: {
        requestAcceptedAt?: Date;
        requesterName: string;
        requesterProfilePic: string;
        requesterJobTitle?: string;
        recipientName: string;
        recipientProfilePic: string;
        recipientJobTitle?: string;
    };
    groupId?: string;
    groupDetails?: {
        groupName: string;
        startDate: Date;
        adminName: string;
        adminProfilePic: string;
        members: {
            name: string;
            profilePic: string;
            joinedAt: Date;
        }[];
    };
}
export declare const getUserContactsService: (userId: string) => Promise<FormattedContact[]>;
export {};
//# sourceMappingURL=contact.service.d.ts.map