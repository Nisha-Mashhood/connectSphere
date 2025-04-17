import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import { socketService } from "../../../../Service/SocketService";
import { getUserContacts } from "../../../../Service/Contact.Service";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatDetailsSidebar from "./ChatDetailsSidebar";
import ChatMessages from "./ChatMessages/ChatMessages";
import ChatInput from "./ChatInput";
import { Card } from "@nextui-org/react";
import { Contact, IChatMessage, Notification } from "../../../../types";

const Chat: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getChatKey = (contact: Contact) =>
    contact.type === "group"
      ? `group_${contact.groupId}`
      : contact.type === "user-mentor"
      ? `user-mentor_${contact.collaborationId}`
      : `user-user_${contact.userConnectionId}`;

  // const updateMessages = (chatKey: string, messages: IChatMessage[]) => {
  //   setAllMessages((prev) => new Map(prev).set(chatKey, messages));
  // };

  useEffect(() => {
    if (!currentUser?._id) return;

    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);

    socketService.onReceiveMessage((message) => {
      const chatKey = getChatKeyFromMessage(message);
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        if (messages.some((m) => m._id === message._id)) return prev;
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });
      handleNotification(message);
    });

    socketService.onMessageSaved((message) => {
      const chatKey = getChatKeyFromMessage(message);
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        if (messages.some((m) => m._id === message._id)) return prev;
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });
    });

    fetchContacts();

    return () => socketService.disconnect();
  }, [currentUser?._id]);

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

  const setInitialContact = (contacts: Contact[]) => {
    if (type && id) {
      const contact = contacts.find((c) => c.id === id && c.type === type);
      if (contact) setSelectedContact(contact);
    } else if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  };

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

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    navigate(`/chat/${contact.type}/${contact.id}`);
    setNotifications((prev) =>
      prev.filter((n) => !(n.contactId === contact.id && n.type === contact.type))
    );
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDetailsSidebar = () => setIsDetailsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar: Hidden on mobile unless toggled */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          notifications={notifications}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col shadow-lg rounded-xl md:rounded-none bg-white dark:bg-gray-900 m-2 md:m-0">
          <ChatHeader
            type={type}
            selectedContact={selectedContact}
            navigate={navigate}
            toggleSidebar={toggleSidebar}
            toggleDetailsSidebar={toggleDetailsSidebar}
            isMobileView={window.innerWidth < 768}
          />
          <ChatMessages
            selectedContact={selectedContact}
            allMessages={allMessages}
            // setAllMessages={updateMessages}
            getChatKey={getChatKey}
            currentUserId={currentUser?._id}
            notifications={notifications}
            onNotificationClick={handleContactSelect}
            messagesEndRef={messagesEndRef}
            // contacts={contacts}
          />
          <ChatInput
            selectedContact={selectedContact}
            currentUserId={currentUser?._id}
            onSendMessage={(message) => socketService.sendMessage(message)}
          />
        </Card>
      </div>

      {/* Details Sidebar: Hidden on mobile unless toggled */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
          isDetailsSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <ChatDetailsSidebar selectedContact={selectedContact} currentUserId={currentUser?._id} />
      </div>

      {/* Overlay for mobile sidebar */}
      {(isSidebarOpen || isDetailsSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsDetailsSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Helper Functions (Unchanged)
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
          _id: member._id, // Added _id
          name: member.name,
          profilePic: member.profilePic,
          joinedAt: new Date(member.joinedAt),
        })),
      }
    : undefined,
});

const getChatKeyFromMessage = (message: IChatMessage) =>
  message.groupId
    ? `group_${message.groupId}`
    : message.collaborationId
    ? `user-mentor_${message.collaborationId}`
    : `user-user_${message.userConnectionId}`;

const deduplicateMessages = (messages: IChatMessage[]) =>
  Array.from(new Map(messages.map((msg) => [msg._id, msg])).values());

const isMessageRelevant = (message: IChatMessage, contact: Contact) =>
  (contact.type === "group" && contact.groupId === message.groupId) ||
  (contact.type === "user-mentor" && contact.collaborationId === message.collaborationId) ||
  (contact.type === "user-user" && contact.userConnectionId === message.userConnectionId);

export default Chat;