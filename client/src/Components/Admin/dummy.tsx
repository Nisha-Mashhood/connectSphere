// import { Contact, IChatMessage, Notification } from "../../../../../types";
// import MessageList from "./MessageList";
// import Notifications from "./Notifications";
// import ScrollToBottomButton from "./ScrollToBottomButton";
// import { useMessages } from "./useMessages";
// import "./ChatMessages.css";

// // Props for the ChatMessages component
// interface ChatMessagesProps {
//   selectedContact: Contact | null;
//   allMessages: Map<string, IChatMessage[]>;
//   setAllMessages: React.Dispatch<React.SetStateAction<Map<string, IChatMessage[]>>>;
//   getChatKey: (contact: Contact) => string;
//   currentUserId?: string;
//   notifications: Notification[];
//   onNotificationClick: (contact: Contact) => void;
//   messagesEndRef: React.RefObject<HTMLDivElement>;
// }

// // Entry point component for rendering chat messages
// const ChatMessages: React.FC<ChatMessagesProps> = ({
//   selectedContact,
//   allMessages,
//   setAllMessages,
//   getChatKey,
//   currentUserId,
//   notifications,
//   onNotificationClick,
//   messagesEndRef,
// }) => {
//   const {
//     isFetching,
//     showScrollDown,
//     messagesContainerRef,
//     scrollToBottom,
//   } = useMessages({
//     selectedContact,
//     allMessages,
//     setAllMessages,
//     getChatKey,
//     messagesEndRef,
//   });

//   return (
//     <div className="flex flex-col flex-grow relative overflow-hidden h-full">
//       {/* Notifications */}
//       <div className="absolute top-0 left-0 right-0 z-10">
//         <Notifications
//           selectedContact={selectedContact}
//           notifications={notifications}
//           onNotificationClick={onNotificationClick}
//         />
//       </div>

//       {/* Message list */}
//       <MessageList
//         selectedContact={selectedContact}
//         allMessages={allMessages}
//         getChatKey={getChatKey}
//         currentUserId={currentUserId}
//         isFetching={isFetching}
//         messagesContainerRef={messagesContainerRef}
//         messagesEndRef={messagesEndRef}
//       />

//       {/* Scroll-to-bottom button */}
//       <ScrollToBottomButton show={showScrollDown} onClick={scrollToBottom} />
//     </div>
//   );
// };

// export default ChatMessages;




















// import React, { useRef, useState, useEffect } from "react";
// import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
// import { Paperclip, Image as ImageIcon, FileText, Video, Send, X, Smile } from "lucide-react";
// import { Contact, IChatMessage } from "../../../../../types";
// import { uploadMedia } from "../../../../../Service/Chat.Service";
// import EmojiPicker from "emoji-picker-react";

// interface ChatInputProps {
//   selectedContact: Contact | null;
//   currentUserId?: string;
//   onSendMessage: (message: IChatMessage & { targetId: string; type: string }) => void;
// }

// const ChatInput: React.FC<ChatInputProps> = ({ selectedContact, currentUserId, onSendMessage }) => {
//   const [messageInput, setMessageInput] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const emojiPickerRef = useRef<HTMLDivElement>(null);
//   const lastUploadTime = useRef<number>(0);

//   const allowedTypes = {
//     image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
//     video: ["video/mp4", "video/webm", "video/quicktime"],
//     file: [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "text/plain",
//       "application/zip",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     ],
//   };

//   useEffect(() => {
//     const textarea = inputRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
//     }
//   }, [messageInput]);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
//         setShowEmojiPicker(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSendMessage = () => {
//     if ((!messageInput.trim() && !selectedFile) || !selectedContact || !currentUserId) return;

//     if (selectedFile) {
//       handleUpload();
//       return;
//     }

//     const isSenderUser = selectedContact.userId === currentUserId;
//     const targetId =
//       selectedContact.type === "group"
//         ? selectedContact.groupId
//         : isSenderUser
//         ? selectedContact.targetId
//         : selectedContact.userId;

//     const message: IChatMessage & { targetId: string; type: string } = {
//       _id: Date.now().toString(),
//       senderId: currentUserId,
//       content: messageInput,
//       contentType: "text",
//       timestamp: new Date().toISOString(),
//       targetId,
//       type: selectedContact.type,
//       ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
//       ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
//       ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
//     };

//     onSendMessage(message);
//     setMessageInput("");
//     inputRef.current?.focus();
//   };

//   const handleFileTypeSelect = (type: "image" | "video" | "file") => {
//     setError(null);
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.accept = allowedTypes[type].join(",");
//       fileInputRef.current.click();
//     }
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file || !selectedContact || !currentUserId) return;

//     const fileType = file.type;
//     const isImage = allowedTypes.image.includes(fileType);
//     const isVideo = allowedTypes.video.includes(fileType);
//     const isFile = allowedTypes.file.includes(fileType);

//     if (!isImage && !isVideo && !isFile) {
//       setError(`Unsupported file type. Please upload a valid file.`);
//       return;
//     }

//     const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
//     if (file.size > maxSize) {
//       setError(`File is too large. Maximum size is ${isVideo ? "50MB" : "10MB"}.`);
//       return;
//     }

//     setSelectedFile(file);
//     setError(null);

//     const url = URL.createObjectURL(file);
//     setPreviewUrl(url);

//     inputRef.current?.focus();
//   };

//   const handleUpload = async () => {
//     if (!selectedFile || !selectedContact || !currentUserId) return;

//     const now = Date.now();
//     if (now - lastUploadTime.current < 1000) return;
//     lastUploadTime.current = now;

//     if (isUploading) return;
//     setIsUploading(true);

//     try {
//       const { url, thumbnailUrl, messageId } = await uploadMedia(
//         selectedFile,
//         currentUserId,
//         selectedContact.id,
//         selectedContact.type,
//         selectedContact.collaborationId,
//         selectedContact.userConnectionId,
//         selectedContact.groupId
//       );

//       const contentType = allowedTypes.image.includes(selectedFile.type)
//         ? "image"
//         : allowedTypes.video.includes(selectedFile.type)
//         ? "video"
//         : "file";

//       const isSenderUser = selectedContact.userId === currentUserId;
//       const targetId =
//         selectedContact.type === "group"
//           ? selectedContact.groupId
//           : isSenderUser
//           ? selectedContact.targetId
//           : selectedContact.userId;

//       const message: IChatMessage & { targetId: string; type: string } = {
//         _id: messageId || Date.now().toString(),
//         senderId: currentUserId,
//         content: url,
//         thumbnailUrl,
//         contentType,
//         timestamp: new Date().toISOString(),
//         targetId,
//         type: selectedContact.type,
//         ...(messageInput.trim() && { caption: messageInput.trim() }),
//         ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
//         ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
//         ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
//         ...(contentType !== "image" && {
//           fileMetadata: {
//             fileName: selectedFile.name,
//             fileSize: selectedFile.size,
//             mimeType: selectedFile.type,
//           },
//         }),
//       };

//       onSendMessage(message);
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       setMessageInput("");
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       setError("Failed to upload file. Please try again.");
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//       inputRef.current?.focus();
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleEmojiClick = (emojiData: any) => {
//     setMessageInput((prev) => prev + emojiData.emoji);
//     inputRef.current?.focus();
//   };

//   const renderPreview = () => {
//     if (!previewUrl || !selectedFile) return null;

//     const isImage = allowedTypes.image.includes(selectedFile.type);
//     const isVideo = allowedTypes.video.includes(selectedFile.type);

//     const fileIcon = isImage ? <ImageIcon size={16} /> : isVideo ? <Video size={16} /> : <FileText size={16} />;

//     const fileName =
//       selectedFile.name.length > 20 ? selectedFile.name.substring(0, 20) + "..." : selectedFile.name;

//     return (
//       <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-purple-100 dark:border-gray-700 mt-2 animate-fade-in">
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
//             {fileIcon}
//             <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
//           </div>
//           <Button
//             isIconOnly
//             size="sm"
//             variant="light"
//             color="danger"
//             className="min-w-0 w-5 h-5 sm:w-6 sm:h-6"
//             onPress={() => {
//               setSelectedFile(null);
//               setPreviewUrl(null);
//             }}
//           >
//             <X size={14} />
//           </Button>
//         </div>

//         <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-2">
//           {isImage && <img src={previewUrl} alt="Preview" className="max-h-32 sm:max-h-40 object-contain w-full" />}
//           {isVideo && <video src={previewUrl} controls className="max-h-32 sm:max-h-40 max-w-full" />}
//           {!isImage && !isVideo && (
//             <div className="py-4 px-4 flex flex-col items-center">
//               <FileText size={24} className="text-gray-500 dark:text-gray-400 mb-2" />
//               <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{selectedFile.name}</span>
//               <span className="text-xs text-gray-400 dark:text-gray-500">
//                 {(selectedFile.size / 1024).toFixed(1)} KB
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col p-2 sm:p-3 bg-white dark:bg-gray-900 border-t border-purple-200 dark:border-gray-800">
//       {error && (
//         <div className="mb-2 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-lg border border-red-200 dark:border-red-800/50 animate-fade-in flex items-center gap-2">
//           <AlertTriangle size={14} />
//           {error}
//         </div>
//       )}

//       {renderPreview()}

//       <div className="flex items-end gap-1 sm:gap-2 mt-1 relative">
//         <div className="flex-shrink-0">
//           <Dropdown placement="top">
//             <DropdownTrigger>
//               <Button
//                 isIconOnly
//                 variant="light"
//                 radius="full"
//                 color="secondary"
//                 disabled={!selectedContact}
//                 className="min-w-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-gray-750"
//                 aria-label="Attach file"
//               >
//                 <Paperclip size={16} />
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu variant="flat" aria-label="File type selection">
//               <DropdownItem
//                 key="image"
//                 startContent={<ImageIcon size={14} />}
//                 onPress={() => handleFileTypeSelect("image")}
//                 className="text-xs sm:text-sm"
//               >
//                 Image
//               </DropdownItem>
//               <DropdownItem
//                 key="video"
//                 startContent={<Video size={14} />}
//                 onPress={() => handleFileTypeSelect("video")}
//                 className="text-xs sm:text-sm"
//               >
//                 Video
//               </DropdownItem>
//               <DropdownItem
//                 key="file"
//                 startContent={<FileText size={14} />}
//                 onPress={() => handleFileTypeSelect("file")}
//                 className="text-xs sm:text-sm"
//               >
//                 Document
//               </DropdownItem>
//             </DropdownMenu>
//           </Dropdown>
//         </div>

//         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

//         <div className="relative flex-1 min-h-10">
//           <textarea
//             ref={inputRef}
//             placeholder={selectedContact ? "Type a message..." : "Select a contact to start chatting"}
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//             onKeyDown={handleKeyPress}
//             rows={1}
//             disabled={!selectedContact}
//             className="w-full p-2 sm:p-3 pr-10 rounded-2xl resize-none bg-purple-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all border border-purple-100 dark:border-gray-700 text-sm sm:text-base"
//             style={{ maxHeight: "120px" }}
//           />

//           <Button
//             isIconOnly
//             variant="light"
//             radius="full"
//             size="sm"
//             className="absolute right-2 bottom-2 min-w-0 w-6 h-6 sm:w-8 sm:h-8 text-purple-500 dark:text-purple-400"
//             onPress={() => setShowEmojiPicker(!showEmojiPicker)}
//             disabled={!selectedContact}
//             aria-label="Toggle emoji picker"
//           >
//             <Smile size={14} />
//           </Button>

//           {showEmojiPicker && (
//             <div
//               ref={emojiPickerRef}
//               className="absolute bottom-12 right-0 z-10 shadow-lg rounded-lg"
//             >
//               <EmojiPicker onEmojiClick={handleEmojiClick} />
//             </div>
//           )}
//         </div>

//         <Button
//           isIconOnly
//           color="primary"
//           radius="full"
//           isLoading={isUploading}
//           onPress={handleSendMessage}
//           disabled={(!messageInput.trim() && !selectedFile) || !selectedContact}
//           className="min-w-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-purple-600 shadow-sm"
//           aria-label="Send message"
//         >
//           <Send size={14} />
//         </Button>
//       </div>

//       {selectedContact?.type === "group" && (
//         <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
//           Messaging {selectedContact.name} • {selectedContact.groupDetails?.members.length || 0}{" "}
//           members
//         </div>
//       )}
//     </div>
//   );
// };

// // AlertTriangle icon 
// const AlertTriangle = (props: { size?: number }) => {
//   const { size = 24 } = props;
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
//       <path d="M12 9v4"></path>
//       <path d="M12 17h.01"></path>
//     </svg>
//   );
// };

// export default ChatInput;















