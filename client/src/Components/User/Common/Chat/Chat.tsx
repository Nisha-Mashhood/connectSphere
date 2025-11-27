import "./Chat.css";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "@nextui-org/react";
import { RootState } from "../../../../redux/store";
import { socketService } from "../../../../Service/SocketService";
import ChatSidebar from "./ChatSidebar/ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatDetailsSidebar from "./ChatDetailsSideBar/ChatDetailsSidebar";
import ChatMessages from "./ChatMessages/ChatMessages";
import ChatInput from "./ChatInput/ChatInput";
import { useChatContacts } from "../../../../Hooks/User/Chat/useChatContacts";
import { useChatMessages } from "../../../../Hooks/User/Chat/useChatMessages";
import { useChatNotifications } from "../../../../Hooks/User/Chat/useChatNotifications";
import { useChatCall } from "../../../../Hooks/User/Chat/useChatCall";
import {
  setIsInChatComponent,
  setActiveChatKey,
} from "../../../../redux/Slice/notificationSlice";
import { getChatKey } from "./utils/contactUtils";



const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  // ---------------- Contacts ----------------
  const {
    sortedContacts,
    selectedContact,
    setInitialContact,
    handleContactSelect,
    unreadCounts,
    refetchUnreadCounts,
  } = useChatContacts(currentUser?.id, getChatKey);

  // ---------------- Notifications ----------------
  const { autoMarkMessageNotificationAsRead } =
    useChatNotifications(currentUser?.id);

  // ---------------- Messages ----------------
  const {
    lastMessages,
    typingUsers,
    fetchLastMessagesForContacts,
  } = useChatMessages((chatKey) => {
    autoMarkMessageNotificationAsRead(chatKey);
    refetchUnreadCounts();
  });

  // ---------------- Calls ----------------
  const call = useChatCall(currentUser?.id);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);


  // ---------------- Set initial contact ----------------
  useEffect(() => {
    if (sortedContacts.length > 0) {
      setInitialContact(sortedContacts);
    }
  }, [sortedContacts, setInitialContact]);


  // ---------------- Socket connection ----------------
  useEffect(() => {
    if (!currentUser?.id) return;

    sessionStorage.setItem("isInChatComponent", "true");
    dispatch(setIsInChatComponent(true));

    socketService.connect(currentUser.id, localStorage.getItem("authToken")!);
    refetchUnreadCounts();

    return () => {
      sessionStorage.removeItem("isInChatComponent");
      dispatch(setIsInChatComponent(false));
      dispatch(setActiveChatKey(null));
      socketService.leaveChat(currentUser.id);
      sessionStorage.removeItem("activeChatKey");
    };
  }, [currentUser?.id, dispatch, refetchUnreadCounts]);

  // ---------------- Fetch last messages ----------------
  useEffect(() => {
    if (sortedContacts.length > 0) {
      fetchLastMessagesForContacts(sortedContacts);
    }
  }, [sortedContacts, fetchLastMessagesForContacts]);

  const closeSidebar = () => setIsSidebarOpen(false);
  const closeDetailsSidebar = () => setIsDetailsSidebarOpen(false);

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* LEFT SIDEBAR*/}
      <div className="hidden md:block w-80 max-w-xs h-full">
        <ChatSidebar
          contacts={sortedContacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          unreadCounts={unreadCounts}
          lastMessages={lastMessages}
          currentUserId={currentUser?.id || ""}
          callLogs={call.callLogs}
        />
      </div>

      {/* MAIN CHAT PANEL */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col shadow-lg rounded-none bg-white dark:bg-gray-900">
          <ChatHeader
            selectedContact={selectedContact}
            typingUsers={typingUsers}
            getChatKey={getChatKey}
            toggleSidebar={() => setIsSidebarOpen(true)}
            toggleDetailsSidebar={() => setIsDetailsSidebarOpen(true)}
            incomingCallDetails={call.incomingCall}
            ringtone={call.ringtone}
            playRingtone={call.playRingtone}
            isRingtonePlaying={call.isRingtonePlaying}
            isVideoCallActive={call.isVideoCallActive}
            setIsVideoCallActive={call.setIsVideoCallActive}
          />

          <ChatMessages
            selectedContact={selectedContact}
            currentUserId={currentUser?.id}
          />

          <ChatInput
            selectedContact={selectedContact}
            currentUserId={currentUser?.id}
            getChatKey={getChatKey}
            onSendMessage={(msg) => socketService.sendMessage(msg)}
          />
        </Card>
      </div>

      {/* RIGHT DETAILS SIDEBAR */}
      {!call.isVideoCallActive && (
        <div className="hidden lg:block w-80 max-w-xs h-full">
          <ChatDetailsSidebar
            selectedContact={selectedContact}
            currentUserId={currentUser?.id}
          />
        </div>
      )}

      {/* LEFT SIDEBAR */}
      {isSidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeSidebar}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-left flex flex-col">
            <ChatSidebar
              contacts={sortedContacts}
              selectedContact={selectedContact}
              onContactSelect={(c) => {
                handleContactSelect(c);
                closeSidebar();
              }}
              unreadCounts={unreadCounts}
              lastMessages={lastMessages}
              chatNotifications={[]}
              currentUserId={currentUser?.id || ""}
              callLogs={call.callLogs}
              isOverlay
              onClose={closeSidebar}
            />
          </div>
        </div>
      )}

      {/* RIGHT DETAILS SIDEBAR*/}
      {isDetailsSidebarOpen && !call.isVideoCallActive && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeDetailsSidebar}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-right flex flex-col">
            <ChatDetailsSidebar
              selectedContact={selectedContact}
              currentUserId={currentUser?.id}
              isOverlay
              onClose={closeDetailsSidebar}
            />
          </div>
        </div>
      )}

      <audio ref={call.ringtone} hidden loop preload="auto" />
    </div>
  );
};

export default Chat;