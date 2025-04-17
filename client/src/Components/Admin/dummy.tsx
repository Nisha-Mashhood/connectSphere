// import React, { useEffect, useRef, useCallback, useState } from "react";
// import { debounce } from "lodash";
// import { Contact, IChatMessage, Notification } from "../../../../../types";
// import { fetchChatMessages } from "../../../../../Service/Chat.Service";
// import { Avatar, Spinner, Tooltip } from "@nextui-org/react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../../redux/store";
// import { MessageSquare, FileText, Video, AlertTriangle, ChevronDown } from "lucide-react";
// import "./ChatMessages.css";

// interface ChatMessagesProps {
//   selectedContact: Contact | null;
//   allMessages: Map<string, IChatMessage[]>;
//   getChatKey: (contact: Contact) => string;
//   currentUserId?: string;
//   notifications: Notification[];
//   onNotificationClick: (contact: Contact) => void;
//   messagesEndRef: React.RefObject<HTMLDivElement>;
// }

// const ChatMessages: React.FC<ChatMessagesProps> = ({
//   selectedContact,
//   allMessages,
//   getChatKey,
//   currentUserId,
//   notifications,
//   onNotificationClick,
//   messagesEndRef,
// }) => {
//   const { currentUser } = useSelector((state: RootState) => state.user);
//   const messagesContainerRef = useRef<HTMLDivElement>(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [initialLoadDone, setInitialLoadDone] = useState(false);
//   const [showScrollDown, setShowScrollDown] = useState(false);

//   const loadMessages = useCallback(
//     async (resetPage = false) => {
//       if (!selectedContact || isFetching || (!hasMore && !resetPage)) return;

//       const chatKey = getChatKey(selectedContact);
//       const container = messagesContainerRef.current;
//       const previousScrollHeight = container?.scrollHeight || 0;

//       setIsFetching(true);
//       const currentPage = resetPage ? 1 : page;
//       try {
//         const { messages: newMessages, total } = await fetchChatMessages(
//           selectedContact.type !== "group" ? selectedContact.contactId : undefined,
//           selectedContact.type === "group" ? selectedContact.groupId : undefined,
//           currentPage
//         );
//         const updatedMessages = resetPage
//           ? newMessages
//           : [...newMessages, ...(allMessages.get(chatKey) || [])];
//         allMessages.set(chatKey, updatedMessages);
//         setHasMore(currentPage * 10 < total);
//         setPage(currentPage + 1);
//         if (resetPage) setInitialLoadDone(true);

//         if (!resetPage && container) {
//           const newScrollHeight = container.scrollHeight;
//           container.scrollTop = newScrollHeight - previousScrollHeight;
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//       } finally {
//         setIsFetching(false);
//       }
//     },
//     [selectedContact, page, isFetching, hasMore, allMessages, getChatKey]
//   );

//   useEffect(() => {
//     if (selectedContact && !initialLoadDone) {
//       setPage(1);
//       setHasMore(true);
//       loadMessages(true);
//     }
//   }, [selectedContact?.id, initialLoadDone, loadMessages]);

//   useEffect(() => {
//     if (selectedContact && allMessages.get(getChatKey(selectedContact))?.length && initialLoadDone) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [allMessages, selectedContact, getChatKey, messagesEndRef, initialLoadDone]);

//   const handleScroll = debounce(() => {
//     if (messagesContainerRef.current) {
//       // Load more messages when scrolling to top
//       if (messagesContainerRef.current.scrollTop === 0 && hasMore && !isFetching) {
//         loadMessages(false);
//       }
      
//       // Show scroll down button when not at bottom
//       const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
//       const atBottom = scrollHeight - scrollTop - clientHeight < 100;
//       setShowScrollDown(!atBottom);
//     }
//   }, 200);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Function to format timestamp
//   const formatTime = (timestamp: string | Date) => {
//     const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
//     if (!(date instanceof Date) || isNaN(date.getTime())) {
//       console.warn("Invalid timestamp:", timestamp);
//       return "Invalid time";
//     }
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };
  
//   // Function to format date for date separators
//   const formatDate = (timestamp: string | number) => {
//     const date = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
    
//     if (date.toDateString() === today.toDateString()) {
//       return "Today";
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     } else {
//       return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
//     }
//   };

//   // Generate message groups by date
//   const getMessagesByDate = (messages: IChatMessage[] | undefined) => {
//     if (!messages) return [];
    
//     const messagesByDate: { date: string, messages: IChatMessage[] }[] = [];
//     let currentDate = '';
    
//     messages.forEach(message => {
//       const messageDate = new Date(message.timestamp).toDateString();
      
//       if (messageDate !== currentDate) {
//         currentDate = messageDate;
//         messagesByDate.push({
//           date: new Date(message.timestamp).toISOString(),
//           messages: [message]
//         });
//       } else {
//         // Add to the last group
//         messagesByDate[messagesByDate.length - 1].messages.push(message);
//       }
//     });
    
//     return messagesByDate;
//   };

//   const getMessageSender = (msg: IChatMessage) => {
//     if (msg.senderId === currentUserId) {
//       return {
//         name: "You",
//         profilePic: currentUser?.profilePic,
//         isSelf: true
//       };
//     }
    
//     // For group chats, find the sender
//     if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
//       const member = selectedContact.groupDetails.members.find(m => m._id === msg.senderId);
//       if (member) {
//         return {
//           name: member.name,
//           profilePic: member.profilePic,
//           isSelf: false
//         };
//       }
//     }
    
//     // Default to the contact
//     return {
//       name: selectedContact?.name || "Unknown",
//       profilePic: selectedContact?.profilePic,
//       isSelf: false
//     };
//   };

//   const renderMessageContent = (msg: IChatMessage, showSender = false) => {
//     const sender = getMessageSender(msg);
//     const isSent = sender.isSelf;
    
//     // Styles based on sender
//     const bubbleClass = isSent 
//       ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-none" 
//       : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none";
    
//     // Time badge
//     const timeBadge = (
//       <span className={`text-xs ${isSent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} opacity-80`}>
//         {formatTime(msg.timestamp)}
//       </span>
//     );

//     return (
//       <div className={`flex ${isSent ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-md ${isSent ? 'ml-auto' : 'mr-auto'}`}>
//         {!isSent && showSender && (
//           <Tooltip content={sender.name} placement="left">
//             <Avatar 
//               src={sender.profilePic} 
//               size="sm" 
//               className="mt-1"
//               showFallback
//               fallback={
//                 <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
//                   {sender.name.charAt(0).toUpperCase()}
//                 </div>
//               }
//             />
//           </Tooltip>
//         )}
//         {isSent && <div className="w-8" />} {/* Spacer for sent messages to maintain alignment */}
        
//         <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
//           {!isSent && showSender && (
//             <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1 mb-1">
//               {sender.name}
//             </span>
//           )}
          
//           <div className={`p-3 ${bubbleClass} shadow-sm`}>
//             {msg.contentType === "text" && (
//               <div className="flex flex-col gap-1">
//                 <span className="break-words">{msg.content}</span>
//                 <div className={`text-right ${isSent ? 'text-blue-100' : 'text-gray-500'} opacity-80 text-xs`}>
//                   {timeBadge}
//                 </div>
//               </div>
//             )}
            
//             {msg.contentType === "image" && (
//               <div className="flex flex-col gap-1">
//                 <div className="rounded-lg overflow-hidden">
//                   <img src={msg.content} alt="Sent image" className="max-w-full h-auto object-cover" />
//                 </div>
//                 <div className={`text-right ${isSent ? 'text-blue-100' : 'text-gray-500'} opacity-80 text-xs`}>
//                   {timeBadge}
//                 </div>
//               </div>
//             )}
            
//             {msg.contentType === "video" && msg.thumbnailUrl && (
//               <div className="flex flex-col gap-1">
//                 <div className="relative w-64 h-48 rounded-lg overflow-hidden">
//                   <img src={msg.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <button
//                       onClick={() => window.open(msg.content, "_blank")}
//                       className="bg-black bg-opacity-60 rounded-full p-3 transform transition-transform hover:scale-110"
//                     >
//                       <Video size={24} className="text-white" />
//                     </button>
//                   </div>
//                 </div>
//                 <div className={`text-right ${isSent ? 'text-blue-100' : 'text-gray-500'} opacity-80 text-xs`}>
//                   {timeBadge}
//                 </div>
//               </div>
//             )}
            
//             {msg.contentType === "file" && (
//               <div className="flex flex-col gap-1">
//                 {msg.thumbnailUrl ? (
//                   <a href={msg.content} target="_blank" rel="noopener noreferrer" className="block w-64">
//                     <div className="relative rounded-lg overflow-hidden">
//                       <img src={msg.thumbnailUrl} alt="File thumbnail" className="w-full h-36 object-cover" />
//                       <div className="absolute bottom-0 w-full bg-black bg-opacity-75 text-white text-sm p-2">
//                         <div className="flex items-center gap-2">
//                           <FileText size={16} />
//                           <span className="truncate">{msg.fileMetadata?.fileName || "File"}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </a>
//                 ) : (
//                   <a 
//                     href={msg.content} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className={`flex items-center gap-2 py-2 px-3 rounded-lg ${
//                       isSent ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
//                     }`}
//                   >
//                     <FileText size={20} />
//                     <span className="truncate max-w-xs">{msg.fileMetadata?.fileName || "File"}</span>
//                   </a>
//                 )}
//                 <div className={`text-right ${isSent ? 'text-blue-100' : 'text-gray-500'} opacity-80 text-xs`}>
//                   {timeBadge}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col flex-grow relative overflow-hidden">
//       {/* Notifications */}
//       {notifications.length > 0 && (
//         <div className="absolute top-0 left-0 right-0 z-10">
//           {notifications.map((notification, index) => (
//             <div
//               key={index}
//               className="m-2 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 
//                         text-amber-800 dark:text-amber-200 rounded-lg shadow-md border border-amber-200 dark:border-amber-700 
//                         cursor-pointer transform transition-transform hover:scale-102 animate-fade-in"
//               onClick={() => {
//                 const contact = null; // Update this logic if needed
//                 if (contact) onNotificationClick(contact);
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
//                 <div className="flex-1">
//                   <div className="font-medium">{notification.message}</div>
//                   <div className="text-xs text-amber-700 dark:text-amber-300">
//                     {new Date(notification.timestamp).toLocaleTimeString()}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Messages Container */}
//       <div
//         ref={messagesContainerRef}
//         className="flex-1 overflow-y-auto mb-4 flex flex-col p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 
//                  dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
//         onScroll={handleScroll}
//       >
//         {/* Loading indicator */}
//         {isFetching && (
//           <div className="flex justify-center p-3">
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm">
//               <Spinner size="sm" color="primary" />
//               <span className="text-sm text-gray-600 dark:text-gray-300">Loading messages...</span>
//             </div>
//           </div>
//         )}

//         {/* Messages or placeholders */}
//         {selectedContact && allMessages.get(getChatKey(selectedContact))?.length === 0 ? (
//           <div className="flex-1 flex flex-col items-center justify-center">
//             <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
//               <MessageSquare size={32} className="text-gray-400 dark:text-gray-500" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet</p>
//             <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1">
//               Send a message to start the conversation
//             </p>
//           </div>
//         ) : !selectedContact ? (
//           <div className="flex-1 flex flex-col items-center justify-center">
//             <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
//               <MessageSquare size={32} className="text-blue-500 dark:text-blue-400" />
//             </div>
//             <p className="text-gray-600 dark:text-gray-300 text-center">Select a contact to start chatting</p>
//           </div>
//         ) : (
//           // Group messages by date
//           getMessagesByDate(allMessages.get(getChatKey(selectedContact)))?.map((dateGroup, groupIndex) => (
//             <div key={groupIndex} className="flex flex-col space-y-4">
//               {/* Date separator */}
//               <div className="flex items-center justify-center my-4">
//                 <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
//                   {formatDate(dateGroup.date)}
//                 </div>
//               </div>
              
//               {/* Messages for this date */}
//               {dateGroup.messages.map((msg, idx) => {
//                 const sender = getMessageSender(msg);
//                 const previousMsg = idx > 0 ? dateGroup.messages[idx - 1] : null;
//                 const previousSender = previousMsg ? getMessageSender(previousMsg) : null;
//                 const showSender = !previousSender || previousSender.name !== sender.name;
                
//                 return (
//                   <div key={`${msg._id}_${msg.timestamp}`} className="animate-fade-in-up">
//                     {renderMessageContent(msg, showSender)}
//                   </div>
//                 );
//               })}
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Scroll to bottom button */}
//       {showScrollDown && (
//         <button
//           className="absolute bottom-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-md 
//                    hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-105"
//           onClick={scrollToBottom}
//           aria-label="Scroll to bottom"
//         >
//           <ChevronDown size={20} className="text-gray-600 dark:text-gray-300" />
//         </button>
//       )}
//     </div>
//   );
// };

// export default ChatMessages;