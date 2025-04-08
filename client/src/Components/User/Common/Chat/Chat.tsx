import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import { socketService } from "../../../../Service/SocketService";
import { getUserContacts } from "../../../../Service/Contact.Service";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
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
  const messagesEndRef = useRef<HTMLDivElement>(null); //Auto scrolling

  const getChatKey = (contact: Contact) =>
    contact.type === "group"
      ? `group_${contact.groupId}`
      : contact.type === "user-mentor"
      ? `user-mentor_${contact.collaborationId}`
      : `user-user_${contact.userConnectionId}`;


      //Connect to Socket & Fetch Data
  useEffect(() => {
    if (!currentUser?._id) return;

    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);

    //Listens for new message
    socketService.onReceiveMessage((message) => {
      // which chat the message belongs to
      const chatKey = getChatKeyFromMessage(message);
      //Updating the chat messages
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });

      //Handles unread message notifications
      handleNotification(message);
    });

    //Handles after message is saved 
    socketService.onMessageSaved((message) => {
      const chatKey = getChatKeyFromMessage(message);
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        const uniqueMessages = deduplicateMessages([...messages, message]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });
    });

    //Fetches contacts from the backend
    fetchContacts();

    //Disconnects socket on unmount
    return () => socketService.disconnect();
  }, [currentUser?._id]);

  //function to fetch contacts
  const fetchContacts = async () => {
    try {
      const contactData = await getUserContacts();
      console.log(contactData);
      const formattedContacts = contactData.map(formatContact);//passes to helper function
      setContacts(formattedContacts);
      setInitialContact(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  //Sets the first contact as default if none is selected.
  const setInitialContact = (contacts: Contact[]) => {
    if (type && id) {
      const contact = contacts.find((c) => c.id === id && c.type === type);
      if (contact) setSelectedContact(contact);
    } else if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  };

  //If the message is from another contact, it adds a notification.
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
    setSelectedContact(contact); //Sets selected contact.
    navigate(`/chat/${contact.type}/${contact.id}`); //Updates the URL
    setNotifications((prev) =>
      prev.filter((n) => !(n.contactId === contact.id && n.type === contact.type)) //Removes notifications for this contact.
    );
  };

  return (
    <div className="flex h-screen max-w-7xl mx-auto p-4">
      {/* ChatSidebar - Shows contacts list*/}
      {!type && (
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          notifications={notifications}
        />
      )}
      <Card className="flex-1">
      {/* ChatHeader - Shows the contact’s name */}
        <ChatHeader type={type} selectedContact={selectedContact} navigate={navigate} />
        {/* ChatMessages - Displays messages*/}
        <ChatMessages
          selectedContact={selectedContact}
          allMessages={allMessages}
          getChatKey={getChatKey}
          currentUserId={currentUser?._id}
          notifications={notifications}
          onNotificationClick={handleContactSelect}
          messagesEndRef={messagesEndRef}
        />
        {/* ChatInput - Sends new messages */}
        <ChatInput
          selectedContact={selectedContact}
          currentUserId={currentUser?._id}
          onSendMessage={(message) => socketService.sendMessage(message)}
        />
      </Card>
    </div>
  );
};

// Helper functions
const formatContact = (contact: any): Contact => ({
  id: contact.targetId,
  contactId: contact._id,
  userId: contact.userId, 
  targetId: contact.targetId,
  collaborationId: contact?.collaborationId,
  userConnectionId: contact?.userConnectionId,
  groupId: contact?.groupId,
  name: contact.targetName || "Unknown",
  profilePic: contact.targetProfilePic || "",
  type: contact.type,
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