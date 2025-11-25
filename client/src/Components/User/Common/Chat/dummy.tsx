// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { Card } from "@nextui-org/react";
// import toast from "react-hot-toast";

// import { RootState } from "../../../../redux/store";
// import { socketService } from "../../../../Service/SocketService";
// import { fetchUserDetails } from "../../../../Service/Auth.service";
// import { getCallLogs } from "../../../../Service/Call.Service";

// import ChatSidebar from "./ChatSidebar";
// import ChatHeader from "./ChatHeader";
// import ChatDetailsSidebar from "./ChatDetailsSideBar/ChatDetailsSidebar";
// import ChatMessages from "./ChatMessages/ChatMessages";
// import ChatInput from "./ChatInput/ChatInput";

// import ringTone from "../../../../assets/ringTone.mp3";

// import { Contact } from "../../../../Interface/User/Icontact";
// import { ICallLog } from "../../../../types";

// import { useChatContacts } from "../../../../Hooks/User/Chat/useChatContacts";
// import { useChatMessages } from "../../../../Hooks/User/Chat/useChatMessages";
// import { useChatNotifications } from "../../../../Hooks/User/Chat/useChatNotifications";

// import {
//   setActiveChatKey,
//   setIsInChatComponent,
// } from "../../../../redux/Slice/notificationSlice";
// import { setSelectedContact as setSelectedContactRedux } from "../../../../redux/Slice/userSlice";
// import { getChatKey } from "./utils/contactUtils";

// const Chat: React.FC = () => {
//   const { type, id } = useParams<{ type?: string; id?: string }>();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { currentUser } = useSelector((state: RootState) => state.user);

//       const {
//     contacts,
//     unreadCounts,
//     refetchUnreadCounts,
//   } = useChatContacts(currentUser?.id, getChatKey);


//   // 🔔 Notifications hook (used for auto mark-as-read)
//   const {
//     chatNotifications,
//     autoMarkMessageNotificationAsRead,
//   } = useChatNotifications(currentUser?.id);

//   // 🔁 This callback is called from useChatMessages on:
//   // - new incoming message
//   // - messagesRead event
//   const handleMessageActivity = useCallback(
//     (chatKey: string) => {
//       autoMarkMessageNotificationAsRead(chatKey);
//       refetchUnreadCounts();
//     },
//     [autoMarkMessageNotificationAsRead, refetchUnreadCounts]
//   );

//   // 💬 Chat messages hook (handles message sockets + typing)
//   const {
//     allMessages,
//     setAllMessages,
//     lastMessages,
//     typingUsers,
//     fetchMessages,
//     fetchLastMessagesForContacts,
//   } = useChatMessages(handleMessageActivity);

//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
//   const [callLogs, setCallLogs] = useState<ICallLog[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);
//   const [isVideoCallActive, setIsVideoCallActive] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const ringtone = useRef<HTMLAudioElement | null>(null);
//   const isRingtonePlaying = useRef(false);

//   const [incomingCall, setIncomingCall] = useState<{
//     userId: string;
//     chatKey: string;
//     callType: "audio" | "video";
//     callerName: string;
//   } | null>(null);

//   console.log("🔔 Redux chatNotifications:", chatNotifications);

//   // ---------- Sort contacts by last message time ----------
//   const sortedContacts = useMemo(() => {
//     return [...contacts].sort((a, b) => {
//       const keyA = getChatKey(a);
//       const keyB = getChatKey(b);

//       const lastA = lastMessages[keyA];
//       const lastB = lastMessages[keyB];

//       const timeA = lastA
//         ? new Date(lastA.createdAt ?? lastA.timestamp).getTime()
//         : a.lastMessageTimestamp
//         ? new Date(a.lastMessageTimestamp).getTime()
//         : 0;

//       const timeB = lastB
//         ? new Date(lastB.createdAt ?? lastB.timestamp).getTime()
//         : b.lastMessageTimestamp
//         ? new Date(b.lastMessageTimestamp).getTime()
//         : 0;

//       return timeB - timeA;
//     });
//   }, [contacts, lastMessages, getChatKey]);

//   // ---------- Preload ringtone ----------
//   useEffect(() => {
//     if (ringtone.current) {
//       console.log("Preloading audio element");
//       ringtone.current.src = ringTone;
//       ringtone.current.load();

//       ringtone.current.onloadeddata = () => {
//         console.log(
//           "Audio element loaded, readyState:",
//           ringtone.current!.readyState
//         );
//         console.log("Audio element src after load:", ringtone.current!.src);
//       };
//       ringtone.current.onerror = (e) => {
//         console.error("Audio element error:", e);
//       };
//     }
//   }, []);

//   // ---------- Play ringtone ----------
//   const playRingtone = useCallback(async () => {
//     console.log("playRingtone: Starting execution");
//     if (ringtone.current && !isRingtonePlaying.current) {
//       console.log(
//         "playRingtone: Audio element exists, readyState:",
//         ringtone.current.readyState
//       );
//       console.log("playRingtone: Current src:", ringtone.current.src);
//       isRingtonePlaying.current = true;
//       try {
//         const canPlayMp3 = ringtone.current.canPlayType("audio/mpeg");
//         console.log("playRingtone: Audio support:", { canPlayMp3 });

//         if (ringtone.current.readyState < 4) {
//           console.log("playRingtone: Audio not ready, waiting for load");
//           await new Promise<void>((resolve, reject) => {
//             ringtone.current!.onloadeddata = () => {
//               console.log(
//                 "playRingtone: Audio loaded, readyState:",
//                 ringtone.current!.readyState
//               );
//               resolve();
//             };
//             ringtone.current!.onerror = (e) => {
//               console.error("playRingtone: Error loading audio:", e);
//               reject(new Error("Failed to load audio"));
//             };
//             ringtone.current!.load();
//           });
//         }

//         const audioContext = new window.AudioContext();
//         if (audioContext.state === "suspended") {
//           console.log("playRingtone: AudioContext suspended, resuming");
//           await audioContext.resume();
//           console.log("playRingtone: AudioContext state:", audioContext.state);
//         }

//         ringtone.current.currentTime = 0;
//         ringtone.current.muted = false;
//         console.log("playRingtone: Attempting to play audio");
//         await ringtone.current.play();
//         console.log("playRingtone: Ringtone playing successfully");
//       } catch (error) {
//         isRingtonePlaying.current = false;
//         console.error("playRingtone: Ringtone playback error:", error);
//         if (error?.name === "NotAllowedError") {
//           console.log("playRingtone: Blocked by autoplay policy:", error);
//           toast.error(
//             "Please click the 'Enable Audio' button to hear the ringtone.",
//             { duration: 5000 }
//           );
//         } else if (error?.name === "AbortError") {
//           console.log("playRingtone: Play interrupted by pause, ignoring");
//         } else {
//           console.error(
//             "playRingtone: Unexpected error playing ringtone:",
//             error
//           );
//           toast.error(
//             "Failed to play ringtone. Please check if the audio file exists."
//           );
//         }
//       }
//     } else if (!ringtone.current) {
//       console.error("playRingtone: Ringtone audio element not initialized");
//       toast.error("Ringtone not available. Audio element not initialized.");
//     } else {
//       console.log("playRingtone: Ringtone already playing, skipping");
//     }
//   }, []);

//   // ---------- Fetch call logs ----------
//   const fetchCallLogs = useCallback(async () => {
//     try {
//       const data = await getCallLogs();
//       setCallLogs(data);
//     } catch (error) {
//       console.error("Error fetching call logs:", error.message);
//     }
//   }, []);

//   // ---------- Set initial contact when contacts load ----------
//   useEffect(() => {
//     if (contacts.length > 0) {
//       setInitialContact(contacts);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [contacts]);

//   // ---------- Main effect: connect socket + call-related handlers ----------
//   useEffect(() => {
//     if (!currentUser?.id) return;

//     // Mark that user is inside Chat component
//     sessionStorage.setItem("isInChatComponent", "true");
//     dispatch(setIsInChatComponent(true));

//     const token = localStorage.getItem("authToken") || "";
//     socketService.connect(currentUser.id, token);

//     // --- CALL: incoming offer ---
//     const handleOffer = async (data: {
//       userId: string;
//       targetId: string;
//       type: string;
//       chatKey: string;
//       offer: RTCSessionDescriptionInit;
//       callType: "audio" | "video";
//     }) => {
//       console.log("Received offer:", data);
//       try {
//         let callerName = "Unknown Caller";
//         if (data.type === "group") {
//           const groupContact = contacts.find(
//             (c) => c.type === "group" && c.groupId === data.targetId
//           );
//           callerName = groupContact?.groupDetails?.groupName || "Group Call";
//         } else {
//           const caller = await fetchUserDetails(data.userId);
//           callerName = caller?.userDetails?.name || "Unknown Caller";
//         }

//         setIncomingCall({
//           userId: data.userId,
//           chatKey: data.chatKey,
//           callType: data.callType,
//           callerName,
//         });
//       } catch (error) {
//         console.error("Error handling offer:", error);
//       }
//     };

//     // --- CALL: answer ---
//     const handleAnswer = () => {
//       if (ringtone.current && isRingtonePlaying.current) {
//         ringtone.current.pause();
//         ringtone.current.currentTime = 0;
//         isRingtonePlaying.current = false;
//       }
//       setIsVideoCallActive(true);
//       setIncomingCall(null);
//     };

//     // --- CALL: ended ---
//     const handleCallEnded = ({
//       chatKey,
//       callType,
//     }: {
//       chatKey: string;
//       callType: "audio" | "video";
//     }) => {
//       console.log("Handling callEnded:", { chatKey, callType });
//       if (selectedContact && getChatKey(selectedContact) === chatKey) {
//         setIsVideoCallActive(false);
//         setIncomingCall(null);
//         if (ringtone.current && isRingtonePlaying.current) {
//           ringtone.current.pause();
//           ringtone.current.currentTime = 0;
//           isRingtonePlaying.current = false;
//         }
//       }
//     };

//     // --- CALL LOG: created ---
//     const handleCallLogCreated = (callLog: ICallLog) => {
//       setCallLogs((prev) => {
//         if (prev.some((log) => log._id === callLog._id)) return prev;
//         return [callLog, ...prev];
//       });

//       if (
//         typeof callLog.senderId !== "string" &&
//         callLog.senderId._id !== currentUser.id
//       ) {
//         // Incoming call
//         playRingtone();
//       } else {
//         toast.success(`Outgoing ${callLog.callType} call started`, {
//           duration: 3000,
//         });
//       }
//     };

//     // --- CALL LOG: updated ---
//     const handleCallLogUpdated = (callLog: ICallLog) => {
//       setCallLogs((prev) =>
//         prev.map((log) => (log._id === callLog._id ? callLog : log))
//       );

//       if (
//         (callLog.status === "missed" || callLog.status === "completed") &&
//         ringtone.current &&
//         isRingtonePlaying.current
//       ) {
//         ringtone.current.pause();
//         ringtone.current.currentTime = 0;
//         isRingtonePlaying.current = false;
//         console.log("Stopped ringtone for callLog:", callLog._id);
//       }
//       setIncomingCall(null);

//       const isSender =
//         typeof callLog.senderId === "string"
//           ? callLog.senderId === currentUser.id
//           : callLog.senderId._id === currentUser.id;

//       const callerName =
//         typeof callLog.senderId === "string"
//           ? callLog.callerName || "Unknown"
//           : callLog.senderId.name || callLog.callerName || "Unknown";

//       if (callLog.status === "missed" && !isSender) {
//         console.log("Missed call from:", callerName);
//       } else if (callLog.status === "completed") {
//         console.log("Completed call with:", callerName);
//       }
//     };

//     socketService.onOffer(handleOffer);
//     socketService.onAnswer(handleAnswer);
//     socketService.onCallEnded(handleCallEnded);
//     socketService.onCallLogCreated(handleCallLogCreated);
//     socketService.onCallLogUpdated(handleCallLogUpdated);

//     refetchUnreadCounts();
//     fetchCallLogs();

//     const currentRingTone = ringtone.current;

//     return () => {
//       console.log("Cleaning up socket listeners in Chat.tsx");
//       sessionStorage.removeItem("isInChatComponent");
//       dispatch(setIsInChatComponent(false));
//       dispatch(setActiveChatKey(null));

//       socketService.leaveChat(currentUser.id);

//       socketService.socket?.off("offer", handleOffer);
//       socketService.socket?.off("answer", handleAnswer);
//       socketService.socket?.off("callEnded", handleCallEnded);
//       socketService.offCallLogCreated(handleCallLogCreated);
//       socketService.offCallLogUpdated(handleCallLogUpdated);

//       if (currentRingTone && isRingtonePlaying.current) {
//         currentRingTone.pause();
//         currentRingTone.currentTime = 0;
//         isRingtonePlaying.current = false;
//       }
//     };
//   }, [
//     currentUser?.id,
//     contacts,
//     dispatch,
//     fetchCallLogs,
//     getChatKey,
//     playRingtone,
//     refetchUnreadCounts,
//     selectedContact,
//   ]);

//   // ---------- Fetch last messages when contacts change ----------
//   useEffect(() => {
//     if (contacts.length > 0) {
//       fetchLastMessagesForContacts(contacts);
//     }
//   }, [contacts, fetchLastMessagesForContacts]);

//   // ---------- Helper: set initial contact ----------
//   const setInitialContact = (contacts: Contact[]) => {
//     if (type && id) {
//       const contact = contacts.find((c) => c.id === id && c.type === type);
//       if (contact) {
//         setSelectedContact(contact);
//         const chatKey = getChatKey(contact);
//         dispatch(setActiveChatKey(chatKey));
//         socketService.emitActiveChat(currentUser!.id, chatKey);
//       }
//     } else if (contacts.length > 0 && !selectedContact) {
//       const first = contacts[0];
//       setSelectedContact(first);
//       const chatKey = getChatKey(first);
//       dispatch(setActiveChatKey(chatKey));
//       socketService.emitActiveChat(currentUser!.id, chatKey);
//     }
//   };

//   // ---------- When user selects a contact from sidebar ----------
//   const handleContactSelect = useCallback(
//     async (contact: Contact) => {
//       console.log("Contact is selected:", contact);

//       if (!contact.contactId && !contact.groupId) {
//         console.warn("Invalid contact: missing contactId or groupId", {
//           contact,
//         });
//         return;
//       }
//       if (contact.type === "user-user" && !contact.userConnectionId) {
//         console.warn("Invalid user-user contact: missing userConnectionId", {
//           contact,
//         });
//         return;
//       }
//       if (contact.type === "user-mentor" && !contact.collaborationId) {
//         console.warn("Invalid user-mentor contact: missing collaborationId", {
//           contact,
//         });
//         return;
//       }

//       setSelectedContact(contact);
//       const chatKey = getChatKey(contact);

//       dispatch(setActiveChatKey(chatKey));
//       socketService.emitActiveChat(currentUser!.id, chatKey);
//       dispatch(setSelectedContactRedux(contact));
//       refetchUnreadCounts();
//       setIsSidebarOpen(false);

//       navigate(`/chat/${contact.type}/${contact.id}`);
//     },
//     [currentUser?.id, dispatch, getChatKey, navigate, refetchUnreadCounts]
//   );

//   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
//   const toggleDetailsSidebar = () =>
//     setIsDetailsSidebarOpen((prev) => !prev);

//   // ---------- Render ----------
//   return (
//     <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-16">
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-[100] w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
//         }`}
//       >
//         <ChatSidebar
//           contacts={sortedContacts}
//           selectedContact={selectedContact}
//           onContactSelect={handleContactSelect}
//           chatNotifications={chatNotifications}
//           unreadCounts={unreadCounts}
//           lastMessages={lastMessages}
//           currentUserId={currentUser?.id || ""}
//           callLogs={callLogs}
//         />
//       </div>

//       {/* Main chat area */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <Card className="flex-1 flex flex-col shadow-lg rounded-xl md:rounded-none bg-white dark:bg-gray-900 m-2 md:m-0">
//           <ChatHeader
//             type={type}
//             selectedContact={selectedContact}
//             navigate={navigate}
//             toggleSidebar={toggleSidebar}
//             toggleDetailsSidebar={toggleDetailsSidebar}
//             isMobileView={window.innerWidth < 768}
//             typingUsers={typingUsers}
//             getChatKey={getChatKey}
//             isVideoCallActive={isVideoCallActive}
//             setIsVideoCallActive={setIsVideoCallActive}
//             incomingCallDetails={incomingCall}
//             ringtone={ringtone}
//             playRingtone={playRingtone}
//             isRingtonePlaying={isRingtonePlaying}
//           />

//           <ChatMessages
//             selectedContact={selectedContact}
//             allMessages={allMessages}
//             setAllMessages={setAllMessages}
//             getChatKey={getChatKey}
//             currentUserId={currentUser?.id}
//             onNotificationClick={handleContactSelect}
//             messagesEndRef={messagesEndRef}
//             fetchMessages={fetchMessages}
//           />

//           <ChatInput
//             selectedContact={selectedContact}
//             currentUserId={currentUser?.id}
//             onSendMessage={(message) =>
//               socketService.sendMessage(message)
//             }
//             getChatKey={getChatKey}
//           />
//         </Card>
//       </div>

//       {/* Details sidebar */}
//       {!isVideoCallActive && (
//         <div
//           className={`fixed inset-y-0 right-0 z-[100] w-80 md:w-1/4 md:static transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 md:bg-transparent ${
//             isDetailsSidebarOpen
//               ? "translate-x-0"
//               : "translate-x-full md:translate-x-0"
//           }`}
//         >
//           <ChatDetailsSidebar
//             selectedContact={selectedContact}
//             currentUserId={currentUser?.id}
//           />
//         </div>
//       )}

//       {(isSidebarOpen || isDetailsSidebarOpen) && (
//         <div
//           className="fixed inset-0 bg-black/50 z-[90] md:hidden"
//           onClick={() => {
//             setIsSidebarOpen(false);
//             setIsDetailsSidebarOpen(false);
//           }}
//         />
//       )}

//       <audio ref={ringtone} loop preload="auto" hidden />
//     </div>
//   );
// };

// export default Chat;
