import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import { socketService } from "../../../../Service/SocketService";
import { getUserContacts } from "../../../../Service/Contact.Service";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatDetailsSidebar from "./ChatDetailsSideBar/ChatDetailsSidebar";
import ChatMessages from "./ChatMessages/ChatMessages";
import ChatInput from "./ChatInput/ChatInput";
import { Card } from "@nextui-org/react";
import { Contact, IChatMessage } from "../../../../types";
import { deduplicateMessages, formatContact, getChatKeyFromMessage } from "./utils/contactUtils";
import { getUnreadMessages } from "../../../../Service/Chat.Service";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { markNotificationAsRead as markNotificationService} from "../../../../Service/NotificationService";
import { markNotificationAsRead } from "../../../../redux/Slice/notificationSlice";
import { setSelectedContact as setSelectedContactRedux} from "../../../../redux/Slice/userSlice";
import { useDispatch } from "react-redux";
import { fetchUserDetails } from "../../../../Service/Auth.service";

const Chat: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(new Map());
  const { notifications } = useSelector((state: RootState) => state.notification);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string[] }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [incomingCall, setIncomingCall] = useState<{
    userId: string;
    chatKey: string;
    callType: "audio" | "video";
    callerName: string;
  } | null>(null);

  const getChatKey = (contact: Contact) =>
    contact.type === "group"
      ? `group_${contact.groupId}`
      : contact.type === "user-mentor"
      ? `user-mentor_${contact.collaborationId}`
      : `user-user_${contact.userConnectionId}`;

  const fetchUnreadCounts = useCallback(
    debounce(async () => {
      if (!currentUser?._id) return;
      try {
        const data = await getUnreadMessages(currentUser._id);
        console.log("Unread Messages:", data);
        setUnreadCounts(data);
      } catch (error: any) {
        toast.error(`Error fetching unread counts: ${error.message}`);
      }
    }, 500),
    [currentUser?._id]
  );

  const updateMessages = useCallback(
    debounce((chatKey: string, newMessages: IChatMessage[]) => {
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        const uniqueMessages = deduplicateMessages([...messages, ...newMessages]);
        return new Map(prev).set(chatKey, uniqueMessages);
      });
    }, 200),
    []
  );

  useEffect(() => {
    if (!currentUser?._id) return;
  
    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);
  
    const handleReceiveMessage = (message: IChatMessage) => {
      const chatKey = getChatKeyFromMessage(message);
      updateMessages(chatKey, [message]);
      fetchUnreadCounts();
    };
  
    const handleMessageSaved = (message: IChatMessage) => {
      const chatKey = getChatKeyFromMessage(message);
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        const updatedMessages = messages.map((m) =>
          m._id === message._id ? { ...m, ...message } : m
        );
        if (!updatedMessages.some((m) => m._id === message._id)) {
          updatedMessages.push(message);
        }
        return new Map(prev).set(chatKey, deduplicateMessages(updatedMessages));
      });
    };
  
    const handleTyping = ({ userId, chatKey }: { userId: string; chatKey: string }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []).filter((id) => id !== userId), userId],
      }));
    };
  
    const handleStopTyping = ({ userId, chatKey }: { userId: string; chatKey: string }) => {
      console.log("Received stopTyping event:", { userId, chatKey });
      setTypingUsers((prev) => ({
        ...prev,
        [chatKey]: (prev[chatKey] || []).filter((id) => id !== userId),
      }));
    };
  
    const handleMessagesRead = ({ chatKey }: { chatKey: string }) => {
      setAllMessages((prev) => {
        const messages = prev.get(chatKey) || [];
        const updatedMessages = messages.map((m) =>
          !m.isRead ? { ...m, isRead: true, status: "read" as const } : m
        );
        return new Map(prev).set(chatKey, updatedMessages);
      });
      setUnreadCounts((prev) => ({ ...prev, [chatKey]: 0 }));
      fetchUnreadCounts();
    };

    const handleOffer = async (data: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit; callType: "audio" | "video" }) => {
      console.log("Received offer:", data);
      try {
        const caller = await fetchUserDetails(data.userId); // Fetch caller details
        setIncomingCall({
          userId: data.userId,
          chatKey: data.chatKey,
          callType: data.callType,
          callerName: caller?.name || "Unknown Caller",
        });
      } catch (error) {
        console.error("Error fetching caller details:", error);
        toast.error("Failed to load caller details.");
      }
    };

    const handleCallEnded = ({ chatKey, callType }: { chatKey: string; callType: "audio" | "video" }) => {
      console.log("Handling callEnded:", { chatKey, callType });
      if (selectedContact && getChatKey(selectedContact) === chatKey) {
        setIsVideoCallActive(false);
        toast.success(`${callType.charAt(0).toUpperCase() + callType.slice(1)} call ended`, { duration: 3000 });
      }
    };
  
    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSaved(handleMessageSaved);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);
    socketService.onMessagesRead(handleMessagesRead);
    socketService.onOffer(handleOffer);
    socketService.onCallEnded(handleCallEnded);

    fetchContacts();
    fetchUnreadCounts();
  
    return () => {
      console.log("Cleaning up socket listeners in Chat.tsx");
      socketService.socket?.off("receiveMessage", handleReceiveMessage);
      socketService.socket?.off("messageSaved", handleMessageSaved);
      socketService.socket?.off("typing", handleTyping);
      socketService.socket?.off("stopTyping", handleStopTyping);
      socketService.socket?.off("messagesRead", handleMessagesRead);
      socketService.socket?.off("offer", handleOffer);
      socketService.socket?.off("callEnded", handleCallEnded);
      socketService.disconnect();
    };
  }, [currentUser?._id, fetchUnreadCounts, updateMessages]);

  const fetchContacts = async () => {
    try {
      const contactData = await getUserContacts();
      const formattedContacts = contactData.map(formatContact);
      console.log("Received contacts :",formattedContacts);
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

  const handleContactSelect = useCallback(
    async (contact: Contact) => {
      setSelectedContact(contact);
      const chatKey = getChatKey(contact);
      socketService.markAsRead(chatKey, currentUser?._id || "", contact.type);
      dispatch(setSelectedContactRedux(contact));
       // Mark relevant notifications as read
       try {
        const relevantNotifications = notifications.filter(
          (n) =>
            n.relatedId === chatKey &&
            n.status === "unread" &&
            (n.type === "message" || n.type === "missed_call" || n.type === 'incoming_call')
        );
        for (const notification of relevantNotifications) {
          await markNotificationService(notification._id, currentUser?._id || "");
          dispatch(markNotificationAsRead(notification._id));
          socketService.markNotificationAsRead(notification._id, currentUser?._id || "");
        }
      navigate(`/chat/${contact.type}/${contact.id}`);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
      fetchUnreadCounts();
      setIsSidebarOpen(false);
    },
    [currentUser?._id, notifications, dispatch, navigate, fetchUnreadCounts]
  );

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDetailsSidebar = () => setIsDetailsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-16">
      <div
        className={`fixed inset-y-0 left-0 z-[100] w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          notifications={notifications}
          unreadCounts={unreadCounts}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col shadow-lg rounded-xl md:rounded-none bg-white dark:bg-gray-900 m-2 md:m-0">
          <ChatHeader
            type={type}
            selectedContact={selectedContact}
            navigate={navigate}
            toggleSidebar={toggleSidebar}
            toggleDetailsSidebar={toggleDetailsSidebar}
            isMobileView={window.innerWidth < 768}
            typingUsers={typingUsers}
            getChatKey={getChatKey}
            isVideoCallActive={isVideoCallActive}
            setIsVideoCallActive={setIsVideoCallActive}
            incomingCallDetails = {incomingCall}
          />
          <ChatMessages
            selectedContact={selectedContact}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            getChatKey={getChatKey}
            currentUserId={currentUser?._id}
            notifications={notifications}
            onNotificationClick={handleContactSelect}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput
            selectedContact={selectedContact}
            currentUserId={currentUser?._id}
            onSendMessage={(message) => socketService.sendMessage(message)}
            getChatKey={getChatKey}
          />
        </Card>
      </div>
      
      {!isVideoCallActive && (
        <div
          className={`fixed inset-y-0 right-0 z-[100] w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
            isDetailsSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <ChatDetailsSidebar selectedContact={selectedContact} currentUserId={currentUser?._id} />
        </div>
      )}
      {(isSidebarOpen || isDetailsSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsDetailsSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Chat;