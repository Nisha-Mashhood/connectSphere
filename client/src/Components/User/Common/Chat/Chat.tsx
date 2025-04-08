// Imports
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import { socketService } from "../../../../Service/SocketService";
import { getUserContacts } from "../../../../Service/Contact.Service";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatDetailsSidebar from "./ChatDetailsSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { Card } from "@nextui-org/react";
import { Contact, IChatMessage, Notification } from "../../../../types";

const Chat: React.FC = () => {
  // Get route params 
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();

  // Get current logged-in user from Redux store
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Local state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to generate chat key based on contact type
  const getChatKey = (contact: Contact) =>
    contact.type === "group"
      ? `group_${contact.groupId}`
      : contact.type === "user-mentor"
      ? `user-mentor_${contact.collaborationId}`
      : `user-user_${contact.userConnectionId}`;

  // Connect socket & listen to real-time messages
  useEffect(() => {
    if (!currentUser?._id) return;

    const token = localStorage.getItem("authToken") || "";

    // Connect to socket
    socketService.connect(currentUser._id, token);

    // Handle incoming real-time message
    socketService.onReceiveMessage((message) => {
      const chatKey = getChatKeyFromMessage(message);

      // Update messages
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        if (messages.some((m) => m._id === message._id)) return prev; // Skip duplicates
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });

      // Create notification if message is from another chat
      handleNotification(message);
    });

    // Handle message that was saved to DB
    socketService.onMessageSaved((message) => {
      const chatKey = getChatKeyFromMessage(message);
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        if (messages.some((m) => m._id === message._id)) return prev;
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });
    });

    // Fetch user’s chat contacts
    fetchContacts();

    // Clean up socket on unmount
    return () => socketService.disconnect();
  }, [currentUser?._id]);

  // Fetch contacts and format them
  const fetchContacts = async () => {
    try {
      const contactData = await getUserContacts();
      const formattedContacts = contactData.map(formatContact);
      setContacts(formattedContacts);
      setInitialContact(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Set initial selected contact based on URL or first contact
  const setInitialContact = (contacts: Contact[]) => {
    if (type && id) {
      const contact = contacts.find((c) => c.id === id && c.type === type);
      if (contact) setSelectedContact(contact);
    } else if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  };

  // Show notification if new message is not in current chat
  const handleNotification = (message: IChatMessage) => {
    const isRelevantChat = selectedContact && isMessageRelevant(message, selectedContact);
    if (!isRelevantChat) {
      const contact = contacts.find((c) => isMessageRelevant(message, c));
      if (contact) {
        setNotifications((prev) => [
          ...prev,
          {
            contactId: contact.id,
            type: contact.type,
            message: `New message from ${contact.name}: ${message.content.substring(0, 20)}...`,
            timestamp: message.timestamp,
          },
        ]);
      }
    }
  };

  // Handle selecting a contact from sidebar
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    navigate(`/chat/${contact.type}/${contact.id}`);
    // Clear notifications for selected contact
    setNotifications((prev) =>
      prev.filter((n) => !(n.contactId === contact.id && n.type === contact.type))
    );
  };

  return (
    <div className="flex h-screen max-w-7xl mx-auto bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Left Sidebar for showing contacts */}
      {!type && (
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          notifications={notifications}
        />
      )}

      {/* Chat Box */}
      <Card className="flex-1 shadow-lg rounded-xl bg-white dark:bg-gray-900 flex flex-col h-full">
        <ChatHeader
          type={type}
          selectedContact={selectedContact}
          navigate={navigate}
        />
        <ChatMessages
          selectedContact={selectedContact}
          allMessages={allMessages}
          getChatKey={getChatKey}
          currentUserId={currentUser?._id}
          notifications={notifications}
          onNotificationClick={handleContactSelect}
          messagesEndRef={messagesEndRef}
          contacts={contacts}
        />
        <ChatInput
          selectedContact={selectedContact}
          currentUserId={currentUser?._id}
          onSendMessage={(message) => socketService.sendMessage(message)}
        />
      </Card>

      {/* Right Sidebar with chat details */}
      <ChatDetailsSidebar
        selectedContact={selectedContact}
        currentUserId={currentUser?._id}
      />
    </div>
  );
};

// === Helper Functions ===

// Format contact object from backend into frontend-friendly shape
const formatContact = (contact: any): Contact => ({
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
        endDate: contact.collaborationDetails.endDate ? new Date(contact.collaborationDetails.endDate) : undefined,
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
          name: member.name,
          profilePic: member.profilePic,
          joinedAt: new Date(member.joinedAt),
        })),
      }
    : undefined,
});

// Generate unique chat key from incoming message
const getChatKeyFromMessage = (message: IChatMessage) =>
  message.groupId
    ? `group_${message.groupId}`
    : message.collaborationId
    ? `user-mentor_${message.collaborationId}`
    : `user-user_${message.userConnectionId}`;

// Remove duplicate messages by ID
const deduplicateMessages = (messages: IChatMessage[]) =>
  Array.from(new Map(messages.map((msg) => [msg._id, msg])).values());

// Check if message is for the given contact
const isMessageRelevant = (message: IChatMessage, contact: Contact) =>
  (contact.type === "group" && contact.groupId === message.groupId) ||
  (contact.type === "user-mentor" && contact.collaborationId === message.collaborationId) ||
  (contact.type === "user-user" && contact.userConnectionId === message.userConnectionId);

export default Chat;
