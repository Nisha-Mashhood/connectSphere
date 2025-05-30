import { findContactsByUserId } from "../repositories/contacts.repository.js";
export const getUserContactsService = async (userId) => {
    try {
        const contacts = await findContactsByUserId(userId);
        const formattedContacts = contacts.map((contact) => {
            let targetId = "";
            let targetName = "Unknown";
            let targetProfilePic = "";
            let targetJobTitle;
            let collaborationId;
            let collaborationDetails;
            let userConnectionId;
            let connectionDetails;
            let groupId;
            let groupDetails;
            const contactUserId = contact.userId._id.toString();
            const contactTargetId = contact.targetUserId?._id.toString();
            if (contact.type === "user-mentor" && contact.collaborationId) {
                if (contactUserId === userId && contactTargetId) {
                    targetId = contactTargetId;
                    targetName = contact.targetUserId?.name || "Unknown";
                    targetProfilePic = contact.targetUserId?.profilePic || "";
                    targetJobTitle = contact.targetUserId?.jobTitle;
                }
                else if (contactTargetId === userId && contactUserId) {
                    targetId = contactUserId;
                    targetName = contact.userId?.name || "Unknown";
                    targetProfilePic = contact.userId?.profilePic || "";
                    targetJobTitle = contact.userId?.jobTitle;
                }
                collaborationId = contact.collaborationId._id.toString();
                collaborationDetails = {
                    startDate: contact.collaborationId.startDate,
                    endDate: contact.collaborationId.endDate,
                    price: contact.collaborationId.price,
                    selectedSlot: contact.collaborationId.selectedSlot,
                    mentorName: contact.collaborationId.mentorId.userId.name || "Unknown",
                    mentorProfilePic: contact.collaborationId.mentorId.userId.profilePic || "",
                    mentorJobTitle: contact.collaborationId.mentorId.userId.jobTitle,
                    userName: contact.collaborationId.userId.name || "Unknown",
                    userProfilePic: contact.collaborationId.userId.profilePic || "",
                    userJobTitle: contact.collaborationId.userId.jobTitle,
                };
            }
            else if (contact.type === "user-user" && contact.userConnectionId) {
                const connection = contact.userConnectionId;
                const otherUser = connection.requester._id.toString() === userId ? connection.recipient : connection.requester;
                targetId = otherUser._id.toString();
                targetName = otherUser.name || "Unknown";
                targetProfilePic = otherUser.profilePic || "";
                targetJobTitle = otherUser.jobTitle;
                userConnectionId = connection._id.toString();
                connectionDetails = {
                    requestAcceptedAt: connection.requestAcceptedAt,
                    requesterName: connection.requester.name || "Unknown",
                    requesterProfilePic: connection.requester.profilePic || "",
                    requesterJobTitle: connection.requester.jobTitle,
                    recipientName: connection.recipient.name || "Unknown",
                    recipientProfilePic: connection.recipient.profilePic || "",
                    recipientJobTitle: connection.recipient.jobTitle,
                };
            }
            else if (contact.type === "group" && contact.groupId) {
                const group = contact.groupId;
                // console.log(`Group ${group.name} members:`, JSON.stringify(group.members, null, 2)); // Log raw group members
                targetId = group._id.toString();
                targetName = group.name || "Unknown";
                targetProfilePic = group.profilePic || "";
                groupId = group._id.toString();
                groupDetails = {
                    groupName: group.name || "Unknown Group",
                    startDate: group.startDate,
                    adminName: group.adminId?.name || "Unknown",
                    adminProfilePic: group.adminId?.profilePic || "",
                    bio: group.bio || "No Bio",
                    price: group.price,
                    maxMembers: group.maxMembers,
                    availableSlots: group.availableSlots,
                    members: group.members.map((member) => {
                        const memberDetails = {
                            userId: member.userId._id.toString(),
                            name: member.userId.name || "Unknown",
                            profilePic: member.userId.profilePic || "",
                            joinedAt: member.joinedAt,
                        };
                        // console.log(`Mapped member for group ${group.name}:`, memberDetails); // Log each mapped member
                        return memberDetails;
                    }),
                };
            }
            return {
                _id: contact._id.toString(),
                contactId: contact.contactId,
                userId: contactUserId,
                targetId,
                type: contact.type,
                targetName,
                targetProfilePic,
                targetJobTitle,
                collaborationId,
                collaborationDetails,
                userConnectionId,
                connectionDetails,
                groupId,
                groupDetails,
            };
        });
        const validContacts = formattedContacts.filter((contact) => contact.userId === userId &&
            contact.userId !== contact.targetId &&
            contact.targetId !== "");
        // console.log("Formatted contacts:", JSON.stringify(formattedContacts, null, 2));
        // console.log("Valid contacts:", JSON.stringify(validContacts, null, 2));
        return validContacts;
    }
    catch (error) {
        console.log("Error in contact service file:", error);
        throw new Error(`Service error fetching contacts: ${error.message}`);
    }
};
//# sourceMappingURL=contact.service.js.map