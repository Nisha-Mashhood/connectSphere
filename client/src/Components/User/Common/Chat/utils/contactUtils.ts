import { Contact, IChatMessage } from "../../../../../types";

// Formats raw contact data from the server into a Contact type
export const formatContact = (contact: any): Contact => ({
  id: contact.targetId,
  contactId: contact._id,
  userId: contact.userId,
  targetId: contact.targetId,
  type: contact.type,
  name: contact.targetName || "Unknown",
  profilePic: contact.targetProfilePic || "",
  targetJobTitle: contact.targetJobTitle,
  collaborationId: contact.collaborationId,
  collaborationDetails: contact.collaborationDetails
    ? {
        startDate: new Date(contact.collaborationDetails.startDate),
        endDate: contact.collaborationDetails.endDate
          ? new Date(contact.collaborationDetails.endDate)
          : undefined,
        price: contact.collaborationDetails.price,
        selectedSlot: contact.collaborationDetails.selectedSlot,
        mentorName: contact.collaborationDetails.mentorName,
        mentorProfilePic: contact.collaborationDetails.mentorProfilePic,
        mentorJobTitle: contact.collaborationDetails.mentorJobTitle,
        userName: contact.collaborationDetails.userName,
        userProfilePic: contact.collaborationDetails.userProfilePic,
        userJobTitle: contact.collaborationDetails.userJobTitle,
      }
    : undefined,
  userConnectionId: contact.userConnectionId,
  connectionDetails: contact.connectionDetails
    ? {
        requestAcceptedAt: contact.connectionDetails.requestAcceptedAt
          ? new Date(contact.connectionDetails.requestAcceptedAt)
          : undefined,
        requesterName: contact.connectionDetails.requesterName,
        requesterProfilePic: contact.connectionDetails.requesterProfilePic,
        requesterJobTitle: contact.connectionDetails.requesterJobTitle,
        recipientName: contact.connectionDetails.recipientName,
        recipientProfilePic: contact.connectionDetails.recipientProfilePic,
        recipientJobTitle: contact.connectionDetails.recipientJobTitle,
      }
    : undefined,
  groupId: contact.groupId,
  groupDetails: contact.groupDetails
    ? {
        startDate: new Date(contact.groupDetails.startDate),
        adminName: contact.groupDetails.adminName,
        adminProfilePic: contact.groupDetails.adminProfilePic,
        members: contact.groupDetails.members.map((member: any) => ({
          _id: member._id,
          name: member.name,
          profilePic: member.profilePic,
          joinedAt: new Date(member.joinedAt),
        })),
      }
    : undefined,
});

// Generates a unique chat key for a message based on its type (group, user-mentor, user-user)
export const getChatKeyFromMessage = (message: IChatMessage) =>
  message.groupId
    ? `group_${message.groupId}`
    : message.collaborationId
    ? `user-mentor_${message.collaborationId}`
    : `user-user_${message.userConnectionId}`;

// Removes duplicate messages by keeping the latest message with each _id
export const deduplicateMessages = (messages: IChatMessage[]) =>
  Array.from(new Map(messages.map((msg) => [msg._id, msg])).values());

// Checks if a message is relevant to a contact based on its type and IDs
export const isMessageRelevant = (message: IChatMessage, contact: Contact) =>
  (contact.type === "group" && contact.groupId === message.groupId) ||
  (contact.type === "user-mentor" && contact.collaborationId === message.collaborationId) ||
  (contact.type === "user-user" && contact.userConnectionId === message.userConnectionId);

// Generates a unique chat key for a contact based on its type
export const getChatKey = (contact: Contact) =>
  contact.type === "group"
    ? `group_${contact.groupId}`
    : contact.type === "user-mentor"
    ? `user-mentor_${contact.collaborationId}`
    : `user-user_${contact.userConnectionId}`;