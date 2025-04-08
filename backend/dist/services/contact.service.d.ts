interface FormattedContact {
    _id: string;
    contactId: string;
    userId: string;
    targetId: string;
    type: "user-mentor" | "user-user" | "group";
    targetName: string;
    targetProfilePic: string;
    collaborationId?: string;
    userConnectionId?: string;
    groupId?: string;
}
export declare const getUserContactsService: (userId: string) => Promise<FormattedContact[]>;
export {};
//# sourceMappingURL=contact.service.d.ts.map