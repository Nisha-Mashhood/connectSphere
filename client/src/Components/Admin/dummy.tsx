// import React, { useState, useEffect, useRef } from "react"; // Added useRef
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../redux/store";
// import { getUserContacts } from "../../../../Service/Contact.Service";
// import { Card, CardBody, Avatar, Button } from "@nextui-org/react";
// import { FaArrowLeft } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import { io, Socket } from "socket.io-client";

// interface Contact {
//   id: string;
//   name: string;
//   profilePic?: string;
//   type: "user-mentor" | "user-user" | "group";
// }

// interface Message {
//   senderId: string;
//   targetId: string;
//   type: string;
//   content: string;
//   contentType: string;
//   timestamp: string;
// }

// const Chat: React.FC = () => {
//   const { type, id } = useParams<{ type?: string; id?: string }>();
//   const navigate = useNavigate();
//   const { currentUser } = useSelector((state: RootState) => state.user);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling
//   const inputRef = useRef<HTMLInputElement>(null); // Ref for input focus

//   // Auto-scroll to the bottom whenever messages change
//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   useEffect(() => {
//     scrollToBottom(); // Scroll whenever messages update
//   }, [messages]);

//   useEffect(() => {
//     if (!currentUser?._id) return;

//     const token = localStorage.getItem("authToken") || "";
//     const newSocket = io("http://localhost:3000", {
//       auth: { token },
//       path: "/socket.io",
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 2000,
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("Connected to Socket.IO server:", newSocket.id);
//       newSocket.emit("joinChats", currentUser._id);
//       console.log(`Emitted joinChats for user: ${currentUser._id}`);
//     });

//     newSocket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error);
//     });

//     newSocket.on("receiveMessage", (message: Message) => {
//       console.log("Received message:", message);
//       console.log(`Current user: ${currentUser?._id}, Selected contact: ${selectedContact?.id}`);

//       const isGroupChat = message.type === "group";
//       const isRelevantChat =
//         isGroupChat
//           ? message.targetId === selectedContact?.id
//           : (message.senderId === selectedContact?.id && message.targetId === currentUser?._id) ||
//             (message.senderId === currentUser?._id && message.targetId === selectedContact?.id);

//       if (isRelevantChat) {
//         setMessages((prev) => {
//           const exists = prev.some(
//             (m) => m.timestamp === message.timestamp && m.content === message.content
//           );
//           if (!exists) {
//             console.log("Adding received message to state:", message);
//             return [...prev, message];
//           }
//           console.log("Duplicate message ignored:", message);
//           return prev;
//         });
//       } else {
//         console.log("Message ignored (not relevant to current chat):", message);
//       }
//     });

//     const fetchContacts = async () => {
//       if (isFetching) {
//         console.log("Already fetching contacts, skipping...");
//         return;
//       }
//       setIsFetching(true);
//       try {
//         console.log("Fetching contacts for user:", currentUser?._id, "with type:", type, "id:", id);
//         const contactData = await getUserContacts();
//         console.log("Contact data from backend:", contactData);

//         const formattedContacts = contactData.map((contact) => ({
//           id: contact.targetId,
//           name: contact.targetName || "Unknown",
//           profilePic: contact.targetProfilePic || "",
//           type: contact.type,
//         }));
//         console.log("Formatted contacts:", formattedContacts);
//         setContacts(formattedContacts);

//         if (type && id) {
//           const specificContact = formattedContacts.find(
//             (c) => c.id === id && c.type === type
//           );
//           console.log("Selected contact from URL:", specificContact || "Not found");
//           setSelectedContact(specificContact || null);
//         } else if (formattedContacts.length > 0 && !selectedContact) {
//           console.log("Setting default contact:", formattedContacts[0]);
//           setSelectedContact(formattedContacts[0]);
//         }

//         // Auto-focus input after contacts load
//         if (inputRef.current) {
//           inputRef.current.focus();
//         }
//       } catch (error: any) {
//         console.error("Error fetching contacts:", error.message);
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchContacts();

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [currentUser?._id, type, id]);

//   const handleContactSelect = (contact: Contact) => {
//     console.log("Manually selected contact:", contact);
//     setSelectedContact(contact);
//     navigate(`/chat/${contact.type}/${contact.id}`);
//     if (inputRef.current) {
//       inputRef.current.focus(); // Focus input when contact changes
//     }
//   };

//   const handleSendMessage = () => {
//     if (!messageInput.trim() || !selectedContact || !currentUser?._id || !socket) return;

//     const message: Message = {
//       senderId: currentUser._id,
//       targetId: selectedContact.id,
//       type: selectedContact.type,
//       content: messageInput,
//       contentType: "text",
//       timestamp: new Date().toISOString(),
//     };

//     console.log("Sending message:", message);
//     socket.emit("sendMessage", message);
//     setMessages((prev) => {
//       const exists = prev.some(
//         (m) => m.timestamp === message.timestamp && m.content === message.content
//       );
//       if (!exists) {
//         console.log("Adding sent message to state:", message);
//         return [...prev, message];
//       }
//       console.log("Sent message already exists, skipping:", message);
//       return prev;
//     });
//     setMessageInput("");
//     if (inputRef.current) {
//       inputRef.current.focus(); // Refocus input after sending
//     }
//   };

//   const renderMessage = (msg: Message) => {
//     const isSent = msg.senderId === currentUser?._id;
//     return (
//       <div
//         key={msg.timestamp}
//         className={`p-2 mb-2 rounded max-w-xs ${
//           isSent
//             ? "bg-green-500 text-black self-end ml-auto"
//             : "bg-white text-black self-start border"
//         }`}
//       >
//         {msg.content}
//       </div>
//     );
//   };

//   const displayedMessages = selectedContact
//     ? messages.filter((msg) =>
//         selectedContact.type === "group"
//           ? msg.targetId === selectedContact.id
//           : (msg.senderId === currentUser?._id && msg.targetId === selectedContact.id) ||
//             (msg.senderId === selectedContact?.id && msg.targetId === currentUser?._id)
//       )
//     : [];

//   return (
//     <div className="flex h-screen max-w-7xl mx-auto p-4">
//       {!type && (
//         <Card className="w-1/4 mr-4">
//           <CardBody>
//             <h2 className="text-lg font-semibold mb-4">Contacts</h2>
//             {contacts.length === 0 ? (
//               <p className="text-gray-500">No contacts found</p>
//             ) : (
//               contacts.map((contact) => (
//                 <div
//                   key={contact.id}
//                   className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                     selectedContact?.id === contact.id ? "bg-gray-200 dark:bg-gray-600" : ""
//                   }`}
//                   onClick={() => handleContactSelect(contact)}
//                 >
//                   <Avatar src={contact.profilePic} size="sm" className="mr-2" />
//                   <span>
//                     {contact.name} ({contact.type})
//                   </span>
//                 </div>
//               ))
//             )}
//           </CardBody>
//         </Card>
//       )}

//       <Card className="flex-1">
//         <CardBody className="flex flex-col h-full">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               {type && (
//                 <Button
//                   isIconOnly
//                   variant="light"
//                   onPress={() => navigate("/chat")}
//                   className="mr-2"
//                 >
//                   <FaArrowLeft />
//                 </Button>
//               )}
//               <h2 className="text-lg font-semibold">
//                 {selectedContact
//                   ? `${selectedContact.name} (${selectedContact.type})`
//                   : "Select a contact to chat"}
//               </h2>
//             </div>
//           </div>
//           <div className="flex-1 overflow-y-auto mb-4">
//             {displayedMessages.length === 0 ? (
//               <p className="text-gray-500 text-center">No messages yet</p>
//             ) : (
//               displayedMessages.map((msg) => renderMessage(msg))
//             )}
//             <div ref={messagesEndRef} /> {/* Invisible div for scrolling */}
//           </div>
//           <div className="flex items-center">
//             <input
//               ref={inputRef} // Attach ref to input
//               type="text"
//               placeholder="Type a message..."
//               value={messageInput}
//               onChange={(e) => setMessageInput(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//               className="flex-1 p-2 border rounded mr-2"
//               disabled={!selectedContact}
//             />
//             <Button
//               color="primary"
//               onPress={handleSendMessage}
//               disabled={!selectedContact}
//             >
//               Send
//             </Button>
//           </div>
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

// export default Chat;