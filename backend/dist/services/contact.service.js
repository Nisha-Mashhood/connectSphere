import { findContactsByUserId } from "../repositories/contacts.repository.js";
export const getUserContactsService = async (userId) => {
    try {
        const contacts = await findContactsByUserId(userId);
        const formattedContacts = contacts.map((contact) => {
            let targetId = "";
            let targetName = "Unknown";
            let targetProfilePic = "";
            let collaborationId;
            let userConnectionId;
            let groupId;
            const contactUserId = contact.userId._id.toString();
            const contactTargetId = contact.targetUserId?._id.toString();
            if (contact.type === "user-mentor" && contact.collaborationId) {
                // Prioritize contacts where the current user is the userId
                if (contactUserId === userId && contactTargetId) {
                    targetId = contactTargetId;
                    targetName = contact.targetUserId?.name || "Unknown";
                    targetProfilePic = contact.targetUserId?.profilePic || "";
                }
                // Fallback to contacts where the current user is the targetUserId
                else if (contactTargetId === userId && contactUserId) {
                    targetId = contactUserId;
                    targetName = contact.userId?.name || "Unknown";
                    targetProfilePic = contact.userId?.profilePic || "";
                }
                collaborationId = contact.collaborationId._id.toString();
            }
            else if (contact.type === "user-user" && contact.userConnectionId) {
                const connection = contact.userConnectionId;
                const otherUser = connection.requester._id.toString() === userId ? connection.recipient : connection.requester;
                targetId = otherUser._id.toString();
                targetName = otherUser.name || "Unknown";
                targetProfilePic = otherUser.profilePic || "";
                userConnectionId = connection._id.toString();
            }
            else if (contact.type === "group" && contact.groupId) {
                const group = contact.groupId;
                targetId = group._id.toString();
                targetName = group.name || "Unknown";
                targetProfilePic = group.profilePic || "";
                groupId = group._id.toString();
            }
            return {
                _id: contact._id.toString(),
                contactId: contact.contactId,
                userId: contactUserId,
                targetId,
                type: contact.type,
                targetName,
                targetProfilePic,
                collaborationId,
                userConnectionId,
                groupId,
            };
        });
        const validContacts = formattedContacts.filter(contact => contact.userId === userId && // Ensure the current user is the userId
            contact.userId !== contact.targetId &&
            contact.targetId !== "");
        console.log("Formatted contact: ", formattedContacts);
        console.log("Valid contacts: ", validContacts);
        return validContacts;
    }
    catch (error) {
        console.log("Error in contact service file:", error);
        throw new Error(`Service error fetching contacts: ${error.message}`);
    }
};
//# sourceMappingURL=contact.service.js.map