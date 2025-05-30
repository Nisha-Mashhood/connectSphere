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
import { fetchChatMessages, getUnreadMessages } from "../../../../Service/Chat.Service";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { markNotificationAsRead as markNotificationService} from "../../../../Service/Notification.Service";
import { markNotificationAsRead, setActiveChatKey, setIsInChatComponent } from "../../../../redux/Slice/notificationSlice";
import { setSelectedContact as setSelectedContactRedux} from "../../../../redux/Slice/userSlice";
import { useDispatch } from "react-redux";
import { fetchUserDetails } from "../../../../Service/Auth.service";
import ringTone from "../../../../assets/ringTone.mp3";
const Chat: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { chatNotifications, isInChatComponent } = useSelector((state: RootState) => state.notification);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(new Map());
  // const { chatNotifications } = useSelector((state: RootState) => state.notification);
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
  const ringtone = useRef<HTMLAudioElement | null>(null);
  const isRingtonePlaying = useRef(false);

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
        console.error("Error fetching unread counts:", error);
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
    if (ringtone.current) {
      console.log("Preloading audio element");
      ringtone.current.src = ringTone; // Set src to imported file
      ringtone.current.load(); // Force preload
      ringtone.current.onloadeddata = () => {
        console.log("Audio element loaded, readyState:", ringtone.current!.readyState);
        console.log("Audio element src after load:", ringtone.current!.src);
      };
      ringtone.current.onerror = (e) => {
        console.error("Audio element error:", e);
        toast.error("Failed to load ringtone audio. Check file path.");
      };
    }
  }, []);


  // Callback to play ringtone
  const playRingtone = useCallback(async () => {
    console.log("playRingtone: Starting execution");
    if (ringtone.current && !isRingtonePlaying.current) {
      console.log("playRingtone: Audio element exists, readyState:", ringtone.current.readyState);
      console.log("playRingtone: Current src:", ringtone.current.src);
      isRingtonePlaying.current = true;
      try {
        // Check audio support
        const canPlayMp3 = ringtone.current.canPlayType("audio/mpeg");
        console.log("playRingtone: Audio support:", { canPlayMp3 });

        // Wait for audio to be ready
        if (ringtone.current.readyState < 4) {
          console.log("playRingtone: Audio not ready, waiting for load");
          await new Promise<void>((resolve, reject) => {
            ringtone.current!.onloadeddata = () => {
              console.log("playRingtone: Audio loaded, readyState:", ringtone.current!.readyState);
              resolve();
            };
            ringtone.current!.onerror = (e) => {
              console.error("playRingtone: Error loading audio:", e);
              reject(new Error("Failed to load audio"));
            };
            ringtone.current!.load();
          });
        }


        // Resume AudioContext if suspended
        const audioContext = new (window.AudioContext)();
        if (audioContext.state === "suspended") {
          console.log("playRingtone: AudioContext suspended, resuming");
          await audioContext.resume();
          console.log("playRingtone: AudioContext state:", audioContext.state);
        }

        // Play audio
        ringtone.current.currentTime = 0;
        ringtone.current.muted = false;
        console.log("playRingtone: Attempting to play audio");
        await ringtone.current.play();
        console.log("playRingtone: Ringtone playing successfully");
      } catch (error: any) {
        isRingtonePlaying.current = false;
        console.error("playRingtone: Ringtone playback error:", error);
        if (error.name === "NotAllowedError") {
          console.log("playRingtone: Blocked by autoplay policy:", error);
          toast.error("Please click the 'Enable Audio' button to hear the ringtone.", { duration: 5000 });
        } else if (error.name === "AbortError") {
          console.log("playRingtone: Play interrupted by pause, ignoring");
        } else {
          console.error("playRingtone: Unexpected error playing ringtone:", error);
          toast.error("Failed to play ringtone. Please check if the audio file exists.");
        }
      }
    } else if (!ringtone.current) {
      console.error("playRingtone: Ringtone audio element not initialized");
      toast.error("Ringtone not available. Audio element not initialized.");
    } else {
      console.log("playRingtone: Ringtone already playing, skipping");
    }
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;

    // Set session flag
    sessionStorage.setItem("isInChatComponent", "true");
    dispatch(setIsInChatComponent(true));
  
    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);
  
    const handleReceiveMessage = async(message: IChatMessage) => {
      const chatKey = getChatKeyFromMessage(message);
      updateMessages(chatKey, [message]);
      fetchUnreadCounts();

      if (isInChatComponent) {
        const relevantNotification = chatNotifications.find(
          n => n.relatedId === chatKey && n.type === "message" && n.status === "unread"
        );
        if (relevantNotification) {
          try {
            await markNotificationService(relevantNotification._id, currentUser._id);
            dispatch(markNotificationAsRead(relevantNotification._id));
            socketService.markNotificationAsRead(relevantNotification._id, currentUser._id);
          } catch (error) {
            console.error("Error marking message notification as read:", error);
          }
        }
      }

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
        let callerName = "Unknown Caller";
        if (data.type === "group") {
          // For group calls, use the group name from contacts
          const groupContact = contacts.find(
            (c) => c.type === "group" && c.groupId === data.targetId
          );
          callerName = groupContact?.groupDetails?.groupName || "Group Call";
        } else {
          // For user or mentor calls, fetch user details
          const caller = await fetchUserDetails(data.userId);
          callerName = caller?.userDetails?.name || "Unknown Caller";
        }

        setIncomingCall({
          userId: data.userId,
          chatKey: data.chatKey,
          callType: data.callType,
          callerName,
        });
        if (isInChatComponent) {
          const relevantNotification = chatNotifications.find(
            n => n.relatedId === data.chatKey && n.type === "incoming_call" && n.status === "unread"
          );
          if (relevantNotification) {
            try {
              await markNotificationService(relevantNotification._id, currentUser._id);
              dispatch(markNotificationAsRead(relevantNotification._id));
              socketService.markNotificationAsRead(relevantNotification._id, currentUser._id);
            } catch (error) {
              console.error("Error marking incoming_call notification as read:", error);
            }
          }
        }
        
      } catch (error) {
        console.error("Error handling offer:", error);
        toast.error("Failed to process incoming call.");
      }
    };

    const handleAnswer = () => {
      // Stop ringtone when call is answered
      if (ringtone.current && isRingtonePlaying.current) {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
        isRingtonePlaying.current = false;
      }
      setIsVideoCallActive(true);
      setIncomingCall(null);
    };

    const handleCallEnded = ({ chatKey, callType }: { chatKey: string; callType: "audio" | "video" }) => {
      console.log("Handling callEnded:", { chatKey, callType });
      if (selectedContact && getChatKey(selectedContact) === chatKey) {
        setIsVideoCallActive(false);
        setIncomingCall(null);
        // Stop ringtone when call ends
        if (ringtone.current && isRingtonePlaying.current) {
          ringtone.current.pause();
          ringtone.current.currentTime = 0;
          isRingtonePlaying.current = false;
        }
        toast.success(`${callType.charAt(0).toUpperCase() + callType.slice(1)} call ended`, { duration: 3000 });
      }
    };
  
    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSaved(handleMessageSaved);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);
    socketService.onMessagesRead(handleMessagesRead);
    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onCallEnded(handleCallEnded);

    fetchContacts();
    fetchUnreadCounts();
  
    return () => {
      console.log("Cleaning up socket listeners in Chat.tsx");
      sessionStorage.removeItem("isInChatComponent");
      dispatch(setIsInChatComponent(false));
      dispatch(setActiveChatKey(null));
      socketService.leaveChat(currentUser._id);
      socketService.socket?.off("receiveMessage", handleReceiveMessage);
      socketService.socket?.off("messageSaved", handleMessageSaved);
      socketService.socket?.off("typing", handleTyping);
      socketService.socket?.off("stopTyping", handleStopTyping);
      socketService.socket?.off("messagesRead", handleMessagesRead);
      socketService.socket?.off("offer", handleOffer);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("callEnded", handleCallEnded);
      // socketService.disconnect();

      if (ringtone.current && isRingtonePlaying.current) {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
        isRingtonePlaying.current = false;
      }
    };
  }, [currentUser?._id, fetchUnreadCounts, updateMessages]);

  const fetchContacts = async () => {
    try {
      const contactData = await getUserContacts();
      const formattedContacts = contactData.map(formatContact);
      // console.log("Received contacts :",formattedContacts);
      setContacts(formattedContacts);
      setInitialContact(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const setInitialContact = (contacts: Contact[]) => {
    if (type && id) {
      const contact = contacts.find((c) => c.id === id && c.type === type);
      if (contact) {
        setSelectedContact(contact);
        const chatKey = getChatKey(contact);
        dispatch(setActiveChatKey(chatKey));
        socketService.emitActiveChat(currentUser._id, chatKey);
      }
    } else if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
      const chatKey = getChatKey(contacts[0]);
      dispatch(setActiveChatKey(chatKey));
      socketService.emitActiveChat(currentUser._id, chatKey);
    }
  };

  const handleContactSelect = useCallback(
    async (contact: Contact) => {
      setSelectedContact(contact);
      const chatKey = getChatKey(contact);
      //wait for message to be load
      try {
        const { messages } = await fetchChatMessages(
          contact.type !== "group" ? contact.contactId : undefined,
          contact.type === "group" ? contact.groupId : undefined,
          1
        );
        setAllMessages((prev) => {
          const currentMessages = prev.get(chatKey) || [];
          const updatedMessages = [...messages, ...currentMessages];
          return new Map(prev).set(chatKey, deduplicateMessages(updatedMessages));
        });
      } catch (error) {
        console.error("Error preloading messages:", error);
      }
      //// Mark as read after loading messages
      dispatch(setActiveChatKey(chatKey));
      socketService.emitActiveChat(currentUser._id, chatKey);
      socketService.markAsRead(chatKey, currentUser?._id || "", contact.type);
      dispatch(setSelectedContactRedux(contact));
       // Mark relevant notifications as read
       try {
        const relevantNotifications = chatNotifications.filter(
          (n) =>
            n.relatedId === chatKey &&
            n.status === "unread" &&
            ["message", "missed_call", "incoming_call"].includes(n.type)
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
    [currentUser?._id, chatNotifications, dispatch, navigate, fetchUnreadCounts]
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
          chatNotifications={chatNotifications}
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
            ringtone={ringtone}
            playRingtone={playRingtone}
            isRingtonePlaying={isRingtonePlaying}
          />
          <ChatMessages
            selectedContact={selectedContact}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            getChatKey={getChatKey}
            currentUserId={currentUser?._id}
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

<audio ref={ringtone} loop preload="auto" hidden />
    </div>
  );
};

export default Chat;