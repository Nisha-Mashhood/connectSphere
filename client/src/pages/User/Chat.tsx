import "../../Components/User/Common/Chat/Chat.css";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "@nextui-org/react";
import { RootState } from "../../redux/store";
import { socketService } from "../../Service/SocketService";
import ChatSidebar from "../../Components/User/Common/Chat/ChatSidebar/ChatSidebar";
import ChatHeader from "../../Components/User/Common/Chat/ChatHeader";
import ChatDetailsSidebar from "../../Components/User/Common/Chat/ChatDetailsSideBar/ChatDetailsSidebar";
import ChatMessages from "../../Components/User/Common/Chat/ChatMessages/ChatMessages";
import ChatInput from "../../Components/User/Common/Chat/ChatInput/ChatInput";

import { useChatContacts } from "../../Hooks/User/Chat/useChatContacts";
import { useChatMessages } from "../../Hooks/User/Chat/useChatMessages";
import { useChatNotifications } from "../../Hooks/User/Chat/useChatNotifications";

import {
  setIsInChatComponent,
  setActiveChatKey,
} from "../../redux/Slice/notificationSlice";

import { getChatKey } from "../../Components/User/Common/Chat/utils/contactUtils";
import { useChatCall } from "../../Hooks/User/Chat/OneToOneCall/useChatCall";

const Chat: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: RootState) => state.user);
  
  // Contacts Hook
  const {
    sortedContacts,
    selectedContact,
    setInitialContact,
    handleContactSelect,
    unreadCounts,
    refetchUnreadCounts,
    lastMessages,
  } = useChatContacts(currentUser?.id, getChatKey);
  
  // Notification Hook
  const { autoMarkMessageNotificationAsRead } = useChatNotifications(
    currentUser?.id
  );
  
  const onMessageActivity = useCallback((chatKey: string) => {
    autoMarkMessageNotificationAsRead(chatKey);
    refetchUnreadCounts();
  }, [autoMarkMessageNotificationAsRead, refetchUnreadCounts]);

  //Message Hook
  const chatMsg = useChatMessages(onMessageActivity)

  // Calls
  const call = useChatCall({
    currentUserId: currentUser?.id,
    selectedContact,
    getChatKey,
  });

  // Initial contact selection
  useEffect(() => {
    if (sortedContacts.length > 0 && !selectedContact) {
      setInitialContact(sortedContacts);
    }
  }, [sortedContacts, setInitialContact, selectedContact]);

  // Socket connection
  useEffect(() => {
    if (!currentUser?.id) return;
    console.log("Inside chat container");
    socketService.emitChatOnline(currentUser.id);
    dispatch(setIsInChatComponent(true));
    refetchUnreadCounts();

    return () => {
      socketService.emitChatOffline(currentUser.id);
      dispatch(setIsInChatComponent(false));
      dispatch(setActiveChatKey(null));
      socketService.leaveChat(currentUser.id);
    };
  }, [currentUser?.id, dispatch, refetchUnreadCounts]);

    const closeSidebar = () => setIsSidebarOpen(false);
    const closeDetailsSidebar = () => setIsDetailsSidebarOpen(false);


  return (
    <div className="relative flex h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      
      {/* LEFT SIDEBAR */}
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

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col rounded-none shadow-lg">
          <ChatHeader
            selectedContact={selectedContact}
            onlineUsers={chatMsg.onlineUsers}
            typingUsers={chatMsg.typingUsers}
            getChatKey={getChatKey}
            currentUserId={currentUser?.id}
            toggleSidebar={() => setIsSidebarOpen(true)}
            toggleDetailsSidebar={() => setIsDetailsSidebarOpen(true)}
            call={call}
          />

          {/* CHAT MESSAGES — passes message state */}
          <ChatMessages
            selectedContact={selectedContact}
            currentUserId={currentUser?.id}
            allMessages={chatMsg.allMessages}
            setAllMessages={chatMsg.setAllMessages}
            fetchMessages={chatMsg.fetchMessages}
          />

          {/* CHAT INPUT */}
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

      {/* LEFT SIDEBAR (mobile overlay) */}
            {isSidebarOpen && (
              <div className="md:hidden">
                <div
                  className="fixed inset-0 bg-black/40 z-40"
                  onClick={closeSidebar}
                />
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
      
            {/* RIGHT DETAILS SIDEBAR (mobile overlay) */}
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
      
            {/* Global ringtone element */}
            <audio ref={call.ringtone} hidden loop preload="auto" />
    </div>
  );
};

export default Chat;
