// import React, { useState, useRef, useEffect } from "react";
// import { Button, Tooltip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
// import { FaArrowLeft, FaPhone, FaVideo, FaBars, FaEllipsisV, FaUserFriends, FaInfoCircle, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaDesktop } from "react-icons/fa";
// import { Contact } from "../../../../types";
// import { WebRTCService } from "../../../../Service/WebRTCService";
// import { socketService } from "../../../../Service/SocketService";
// import toast from "react-hot-toast";

// // Singleton WebRTCService instance
// // Creates a single instance of WebRTCService to manage WebRTC connections for audio/video calls
// const webrtcService = new WebRTCService();

// // UUID generator for group call IDs
// // Generates a random UUID for unique identification of group call sessions
// const generateUUID = () => {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r = Math.random() * 16 | 0;
//     const v = c === 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// };

// interface ChatHeaderProps {
//   type?: string;
//   selectedContact: Contact | null;
//   navigate: (path: string) => void;
//   toggleSidebar?: () => void;
//   toggleDetailsSidebar?: () => void;
//   isMobileView?: boolean;
//   typingUsers: { [key: string]: string[] };
//   getChatKey: (contact: Contact) => string;
//   isVideoCallActive: boolean;
//   setIsVideoCallActive: React.Dispatch<React.SetStateAction<boolean>>;
//   incomingCallDetails: { userId: string; chatKey: string; callType: "audio" | "video"; callerName: string } | null;
//   ringtone: React.MutableRefObject<HTMLAudioElement>;
//   playRingtone: () => Promise<void>;
//   isRingtonePlaying: React.MutableRefObject<boolean>;
// }

// const ChatHeader: React.FC<ChatHeaderProps> = ({
//   type,
//   selectedContact,
//   navigate,
//   toggleSidebar,
//   toggleDetailsSidebar,
//   isMobileView,
//   typingUsers,
//   getChatKey,
//   isVideoCallActive,
//   setIsVideoCallActive,
//   incomingCallDetails,
//   ringtone,
//   playRingtone,
//   isRingtonePlaying,
// }) => {
//   // Media element refs
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const localAudioRef = useRef<HTMLAudioElement>(null);
//   const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
//   const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
//   // Stream states
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
//   // Call states
//   const [isAudioCallActive, setIsAudioCallActive] = useState(false);
//   const [isIncomingCall, setIsIncomingCall] = useState(false);
//   const [isStartingCall, setIsStartingCall] = useState(false);
//   // Incoming call data
//   const [incomingCallData, setIncomingCallData] = useState<{
//     userId: string;
//     targetId: string;
//     type: string;
//     chatKey: string;
//     offer: RTCSessionDescriptionInit;
//     callType: "audio" | "video";
//     callId?: string;
//   } | null>(null);
//   // ICE candidate queue
//   const iceCandidateQueue = useRef<Map<string, RTCIceCandidate[]>>(new Map());
//   // Call control states
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [hasProcessedAnswer, setHasProcessedAnswer] = useState<{ [userId: string]: boolean }>({});
//   const [isCallTerminated, setIsCallTerminated] = useState(false);
//   // Group call ID
//   const [groupCallId, setGroupCallId] = useState<string | null>(null);

//   // Stop ringtone when modal closes
//   useEffect(() => {
//     if (!isIncomingCall && ringtone.current && ringtone.current.currentTime > 0) {
//       console.log("Modal closed, stopping ringtone");
//       ringtone.current.pause();
//       ringtone.current.currentTime = 0;
//       isRingtonePlaying.current = false;
//     }
//   }, [isIncomingCall, ringtone]);

//   // Play ringtone for incoming calls
//   useEffect(() => {
//     if (isIncomingCall && incomingCallData) {
//       console.log("Incoming call detected, attempting to play ringtone");
//       playRingtone().catch((error) => {
//         console.error("Auto-play ringtone failed:", error);
//         if (error.name === "NotAllowedError") {
//           toast.error("Please click 'Enable Audio' to hear the ringtone.", { duration: 5000 });
//         }
//       });
//     }
//   }, [isIncomingCall, incomingCallData, playRingtone]);

//   // Setup socket and WebRTC listeners
//   useEffect(() => {
//     if (!selectedContact) return;

//     console.log("Setting up listeners for contact:", selectedContact.id);
//     const chatKey = getChatKey(selectedContact);

//     // Handle one-on-one call offer
//     const handleOffer = (data: {
//       userId: string;
//       targetId: string;
//       type: string;
//       chatKey: string;
//       offer: RTCSessionDescriptionInit;
//       callType: "audio" | "video";
//     }) => {
//       if (data.chatKey === chatKey && !isVideoCallActive && !isAudioCallActive) {
//         console.log(`Incoming ${data.callType} call offer:`, data);
//         setIncomingCallData(data);
//         setIsIncomingCall(true);
//         setIsCallTerminated(false);
//       }
//     };

//     // Handle group call offer
//     const handleGroupOffer = (data: {
//       groupId: string;
//       offer: RTCSessionDescriptionInit;
//       callerId: string;
//       callType: "audio" | "video";
//       callId: string;
//     }) => {
//       if (selectedContact.groupId === data.groupId && !isVideoCallActive && !isAudioCallActive) {
//         console.log(`Incoming group ${data.callType} call offer:`, data);
//         setIncomingCallData({
//           userId: data.callerId,
//           targetId: data.groupId,
//           type: "group",
//           chatKey,
//           offer: data.offer,
//           callType: data.callType,
//           callId: data.callId,
//         });
//         setIsIncomingCall(true);
//         setIsCallTerminated(false);
//         setGroupCallId(data.callId);
//       }
//     };

//     // Handle one-on-one call answer
//     const handleAnswer = (data: {
//       userId: string;
//       targetId: string;
//       type: string;
//       chatKey: string;
//       answer: RTCSessionDescriptionInit;
//       callType: "audio" | "video";
//     }) => {
//       if (data.chatKey === chatKey && !hasProcessedAnswer[data.userId]) {
//         console.log(`Received ${data.callType} answer from ${data.userId}:`, data);
//         const peerConnection = webrtcService.getPeerConnection(data.userId);
//         if (peerConnection && peerConnection.signalingState !== "have-local-offer") {
//           console.warn(`Cannot set remote answer: Invalid signaling state (${peerConnection.signalingState})`);
//           return;
//         }
//         setHasProcessedAnswer((prev) => ({ ...prev, [data.userId]: true }));
//         webrtcService.setRemoteDescription(data.answer, data.userId).then(() => {
//           const queue = iceCandidateQueue.current.get(data.userId) || [];
//           while (queue.length > 0) {
//             const candidate = queue.shift();
//             if (candidate) {
//               webrtcService.addIceCandidate(candidate, data.userId).catch((error) => {
//                 console.error("Error applying queued ICE candidate:", error);
//               });
//             }
//           }
//           iceCandidateQueue.current.set(data.userId, queue);
//         }).catch((error) => {
//           console.error("Error setting remote answer:", error);
//         });
//       }
//     };

//     // Handle group call answer
//     const handleGroupAnswer = (data: {
//       groupId: string;
//       answer: RTCSessionDescriptionInit;
//       answererId: string;
//       callerId: string;
//       callType: "audio" | "video";
//       callId: string;
//     }) => {
//       if (selectedContact.groupId === data.groupId && !hasProcessedAnswer[data.answererId]) {
//         console.log(`Received group ${data.callType} answer from ${data.answererId}:`, data);
//         const peerConnection = webrtcService.getPeerConnection(data.answererId);
//         if (peerConnection && peerConnection.signalingState !== "have-local-offer") {
//           console.warn(`Cannot set remote answer: Invalid signaling state (${peerConnection.signalingState})`);
//           return;
//         }
//         setHasProcessedAnswer((prev) => ({ ...prev, [data.answererId]: true }));
//         webrtcService.setRemoteDescription(data.answer, data.answererId).then(() => {
//           const queue = iceCandidateQueue.current.get(data.answererId) || [];
//           while (queue.length > 0) {
//             const candidate = queue.shift();
//             if (candidate) {
//               webrtcService.addIceCandidate(candidate, data.answererId).catch((error) => {
//                 console.error("Error applying queued ICE candidate:", error);
//               });
//             }
//           }
//           iceCandidateQueue.current.set(data.answererId, queue);
//         }).catch((error) => {
//           console.error("Error setting group answer:", error);
//         });
//       }
//     };

//     // Handle one-on-one ICE candidate
//     const handleIceCandidate = (data: {
//       userId: string;
//       targetId: string;
//       type: string;
//       chatKey: string;
//       candidate: RTCIceCandidateInit;
//       callType: "audio" | "video";
//     }) => {
//       if (data.chatKey === chatKey) {
//         console.log(`Received ${data.callType} ICE candidate from ${data.userId}:`, data);
//         const peerConnection = webrtcService.getPeerConnection(data.userId);
//         if (!peerConnection) {
//           console.log("Queuing ICE candidate: peer connection not initialized");
//           if (!iceCandidateQueue.current.has(data.userId)) {
//             iceCandidateQueue.current.set(data.userId, []);
//           }
//           iceCandidateQueue.current.get(data.userId)!.push(new RTCIceCandidate(data.candidate));
//           return;
//         }
//         if (!webrtcService.hasRemoteDescription(data.userId)) {
//           console.log("Queuing ICE candidate: remote description not set");
//           if (!iceCandidateQueue.current.has(data.userId)) {
//             iceCandidateQueue.current.set(data.userId, []);
//           }
//           iceCandidateQueue.current.get(data.userId)!.push(new RTCIceCandidate(data.candidate));
//           return;
//         }
//         webrtcService.addIceCandidate(new RTCIceCandidate(data.candidate), data.userId).catch((error) => {
//           console.error("Error adding ICE candidate:", error);
//         });
//       }
//     };

//     // Handle group ICE candidate
//     const handleGroupIceCandidate = (data: {
//       groupId: string;
//       candidate: RTCIceCandidateInit;
//       senderId: string;
//       recipientId: string;
//       callType: "audio" | "video";
//       callId: string;
//     }) => {
//       if (selectedContact.groupId === data.groupId) {
//         console.log(`Received group ${data.callType} ICE candidate from ${data.senderId}:`, data);
//         const peerConnection = webrtcService.getPeerConnection(data.senderId);
//         if (!peerConnection) {
//           console.log("Queuing group ICE candidate: peer connection not initialized");
//           if (!iceCandidateQueue.current.has(data.senderId)) {
//             iceCandidateQueue.current.set(data.senderId, []);
//           }
//           iceCandidateQueue.current.get(data.senderId)!.push(new RTCIceCandidate(data.candidate));
//           return;
//         }
//         if (!webrtcService.hasRemoteDescription(data.senderId)) {
//           console.log("Queuing group ICE candidate: remote description not set");
//           if (!iceCandidateQueue.current.has(data.senderId)) {
//             iceCandidateQueue.current.set(data.senderId, []);
//           }
//           iceCandidateQueue.current.get(data.senderId)!.push(new RTCIceCandidate(data.candidate));
//           return;
//         }
//         webrtcService.addIceCandidate(new RTCIceCandidate(data.candidate), data.senderId).catch((error) => {
//           console.error("Error adding group ICE candidate:", error);
//         });
//       }
//     };

//     // Handle one-on-one call end
//     const handleCallEnded = (data: {
//       userId: string;
//       targetId: string;
//       type: string;
//       chatKey: string;
//       callType: "audio" | "video";
//     }) => {
//       if (data.chatKey === chatKey) {
//         console.log(`Received callEnded for ${data.callType} call:`, data);
//         if (data.callType === "video") {
//           endVideoCall();
//         } else {
//           endAudioCall();
//         }
//         setIsIncomingCall(false);
//         setIncomingCallData(null);
//         setGroupCallId(null);
//       }
//     };

//     // Handle group call end
//     const handleGroupCallEnded = (data: {
//       groupId: string;
//       userId: string;
//       callType: "audio" | "video";
//       callId: string;
//     }) => {
//       if (selectedContact.groupId === data.groupId) {
//         console.log(`Received group callEnded for ${data.callType} call:`, data);
//         if (data.callType === "video") {
//           endVideoCall();
//         } else {
//           endAudioCall();
//         }
//         setIsIncomingCall(false);
//         setIncomingCallData(null);
//         setGroupCallId(null);
//       }
//     };

//     // Handle notifications
//     const handleNotificationNew = (notification: {
//       _id: string;
//       userId: string;
//       type: "message" | "incoming_call" | "missed_call";
//       content: string;
//       relatedId: string;
//       status: "unread" | "read";
//       senderId: string;
//       createdAt: string;
//       updatedAt: string;
//     }) => {
//       if (notification.relatedId === chatKey && notification.type === "missed_call") {
//         console.log("Received missed call notification:", notification);
//         toast.error(notification.content, { duration: 5000 });
//       }
//     };

//     // Register socket listeners
//     socketService.onOffer(handleOffer);
//     socketService.onGroupCallOffer(handleGroupOffer);
//     socketService.onAnswer(handleAnswer);
//     socketService.onGroupCallAnswer(handleGroupAnswer);
//     socketService.onIceCandidate(handleIceCandidate);
//     socketService.onGroupIceCandidate(handleGroupIceCandidate);
//     socketService.onCallEnded(handleCallEnded);
//     socketService.onGroupCallEnded(handleGroupCallEnded);
//     socketService.onNotificationNew(handleNotificationNew);

//     // Cleanup
//     return () => {
//       console.log("Cleaning up socket listeners for chatKey:", chatKey);
//       socketService.socket?.off("offer", handleOffer);
//       socketService.socket?.off("group-call-offer", handleGroupOffer);
//       socketService.socket?.off("answer", handleAnswer);
//       socketService.socket?.off("group-call-answer", handleGroupAnswer);
//       socketService.socket?.off("ice-candidate", handleIceCandidate);
//       socketService.socket?.off("group-ice-candidate", handleGroupIceCandidate);
//       socketService.socket?.off("callEnded", handleCallEnded);
//       socketService.socket?.off("group-call-ended", handleGroupCallEnded);
//       socketService.socket?.off("notification.new", handleNotificationNew);
//     };
//   }, [selectedContact, getChatKey, isVideoCallActive, isAudioCallActive]);

//   // Auto-decline incoming call after 30 seconds
//   useEffect(() => {
//     let timeout: number;
//     if (isIncomingCall && incomingCallData && selectedContact) {
//       timeout = setTimeout(() => {
//         console.log(`Auto-declining ${incomingCallData.callType} call after 30 seconds`);
//         declineCall();
//       }, 30000);
//     }
//     return () => clearTimeout(timeout);
//   }, [isIncomingCall, incomingCallData, selectedContact]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       console.log("Cleaning up WebRTC on unmount");
//       if (!isVideoCallActive && !isAudioCallActive) {
//         webrtcService.stop();
//       }
//       setLocalStream(null);
//       setRemoteStreams(new Map());
//       setHasProcessedAnswer({});
//       setIsAudioCallActive(false);
//       setIsVideoCallActive(false);
//       setIsAudioMuted(false);
//       setIsVideoOff(false);
//       setIsScreenSharing(false);
//       setGroupCallId(null);
//     };
//   }, []);

//   // Setup WebRTC listeners
//   const setupWebRTCListeners = () => {
//   console.log("Setting up WebRTC listeners");
//   if (selectedContact?.type === "group") {
//     // Group call: Update remote streams
//     const remoteStreams: { userId: string; stream: MediaStream }[] = webrtcService.getRemoteStreams();
//     for (const { userId, stream } of remoteStreams) {
//       console.log(`Setting up stream for group participant ${userId}`);
//       setRemoteStreams((prev) => new Map(prev).set(userId, stream));
//     }
//     const interval = setInterval(() => {
//       const streams: { userId: string; stream: MediaStream }[] = webrtcService.getRemoteStreams();
//       setRemoteStreams((prev) => {
//         const newStreams = new Map(prev);
//         for (const { userId, stream } of streams) {
//           newStreams.set(userId, stream);
//         }
//         return newStreams;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   } else {
//     // One-on-one call
//     const peerConnection = webrtcService.getPeerConnection();
//     if (peerConnection) {
//       peerConnection.ontrack = (event) => {
//         const remoteStream = event.streams[0];
//         console.log("Received remote stream, tracks:", remoteStream.getTracks());
//         setRemoteStreams((prev) => new Map(prev).set("remote", remoteStream));
//       };
//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate && selectedContact) {
//           console.log("Sending ICE candidate:", event.candidate);
//           const targetId = selectedContact.targetId || selectedContact.groupId || "";
//           const callType = isAudioCallActive ? "audio" : "video";
//           socketService.sendIceCandidate(targetId, selectedContact.type, getChatKey(selectedContact), event.candidate, callType);
//         }
//       };
//       peerConnection.onicecandidateerror = (event) => {
//         console.error("ICE candidate error:", event);
//       };
//     }
//   }
// };

//   // Toggle audio
//   const toggleAudio = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsAudioMuted(!audioTrack.enabled);
//         console.log("Audio track toggled:", audioTrack.enabled ? "unmuted" : "muted");
//       }
//     }
//   };

//   // Toggle video
//   const toggleVideo = () => {
//     if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsVideoOff(!videoTrack.enabled);
//         console.log("Video track toggled:", videoTrack.enabled ? "on" : "off");
//       }
//     }
//   };

//   // Toggle screen sharing
//   const toggleScreenShare = async () => {
//     if (!webrtcService || !localStream) {
//       console.warn("Cannot toggle screen share: Missing WebRTC or stream");
//       return;
//     }
//     if (isScreenSharing) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (selectedContact?.type === "group") {
//   const remoteStreams: { userId: string; stream: MediaStream }[] = webrtcService.getRemoteStreams();
//   for (const { userId, stream } of remoteStreams) {
//     const peerConnection = webrtcService.getPeerConnection(userId);
//     if (peerConnection && videoTrack) {
//       const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//       if (sender) {
//         await sender.replaceTrack(videoTrack);
//         console.log(`Screen sharing stopped for ${userId}`);
//       }
//     }
//   }
// } else {
//         const peerConnection = webrtcService.getPeerConnection();
//         if (peerConnection && videoTrack) {
//           const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//           if (sender) {
//             await sender.replaceTrack(videoTrack);
//             console.log("Screen sharing stopped");
//           }
//         }
//       }
//       setIsScreenSharing(false);
//     } else {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//         const screenTrack = screenStream.getVideoTracks()[0];
//         if (selectedContact?.type === "group") {
//           const remoteStreams: { userId: string; stream: MediaStream }[] = webrtcService.getRemoteStreams();
//           for (const { userId, stream } of remoteStreams) {
//             const peerConnection = webrtcService.getPeerConnection(userId);
//             if (peerConnection && screenTrack) {
//               const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//               if (sender) {
//                 await sender.replaceTrack(screenTrack);
//                 console.log(`Screen sharing started for ${userId}`);
//               }
//             }
//           }
//         } else {
//           const peerConnection = webrtcService.getPeerConnection();
//           if (peerConnection) {
//             const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//             if (sender) {
//               await sender.replaceTrack(screenTrack);
//               console.log("Screen sharing started");
//             }
//           }
//         }
//         screenTrack.onended = () => {
//           const videoTrack = localStream.getVideoTracks()[0];
//           if (selectedContact?.type === "group") {
//             const remoteStreams: { userId: string; stream: MediaStream }[] = webrtcService.getRemoteStreams();
//            for (const { userId, stream } of remoteStreams) {
//               const peerConnection = webrtcService.getPeerConnection(userId);
//               if (peerConnection && videoTrack) {
//                 const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//                 if (sender) {
//                   sender.replaceTrack(videoTrack);
//                   console.log(`Screen sharing ended for ${userId}`);
//                 }
//               }
//             }
//           } else {
//             const peerConnection = webrtcService.getPeerConnection();
//             if (peerConnection && videoTrack) {
//               const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
//               if (sender) {
//                 sender.replaceTrack(videoTrack);
//                 console.log("Screen sharing ended");
//               }
//             }
//           }
//           setIsScreenSharing(false);
//         };
//         setIsScreenSharing(true);
//       } catch (error) {
//         console.error("Error starting screen share:", error);
//         if (error instanceof DOMException && error.name === "NotAllowedError") {
//           alert("Screen sharing permission denied.");
//         }
//       }
//     }
//   };

//   // Get header gradient
//   const getGradient = () => {
//     if (!selectedContact) return "from-violet-500 to-fuchsia-500";
//     switch (selectedContact.type) {
//       case "user-mentor":
//         return "from-blue-500 to-cyan-400";
//       case "user-user":
//         return "from-purple-500 to-pink-500";
//       case "group":
//         return "from-emerald-500 to-teal-400";
//       default:
//         return "from-violet-500 to-fuchsia-500";
//     }
//   };

//   // Get typing indicator
//   const getTypingIndicator = () => {
//     if (!selectedContact) return null;
//     const chatKey = getChatKey(selectedContact);
//     const typingUserIds = typingUsers[chatKey] || [];
//     if (typingUserIds.length === 0) return null;

//     const typingUsersNames = typingUserIds
//       .map((userId) => {
//         let memberName: string | undefined;
//         if (selectedContact.type === "group" && selectedContact.groupDetails?.members) {
//           memberName = selectedContact.groupDetails.members.find((m) => m.userId === userId)?.name;
//         } else if (selectedContact.type === "user-mentor" && selectedContact.collaborationDetails) {
//           if (selectedContact.userId === userId) {
//             memberName = selectedContact.collaborationDetails.userName;
//           } else if (selectedContact.contactId === userId) {
//             memberName = selectedContact.collaborationDetails.mentorName;
//           }
//         } else if (selectedContact.type === "user-user") {
//           if (selectedContact.userId === userId) {
//             memberName = selectedContact.connectionDetails.requesterName;
//           } else if (selectedContact.contactId === userId) {
//             memberName = selectedContact.connectionDetails.recipientName;
//           }
//         }
//         return memberName || "Unknown";
//       })
//       .filter(Boolean)
//       .join(", ");

//     if (!typingUsersNames) return null;

//     return (
//       <p className="text-xs text-green-200 animate-pulse">
//         ... {typingUsersNames} {typingUsersNames.includes(",") ? "are" : "is"} typing
//       </p>
//     );
//   };

//   // Start video call
//   const startVideoCall = async () => {
//     if (!selectedContact) {
//       console.log("No contact selected for video call");
//       return;
//     }
//     if (isStartingCall) {
//       console.log("Video call already in progress");
//       return;
//     }
//     setIsStartingCall(true);
//     try {
//       console.log("Starting video call for contact:", selectedContact.id);
//       const chatKey = getChatKey(selectedContact);
//       const targetId = selectedContact.targetId || selectedContact.groupId || "";
//       const userId = localStorage.getItem("userId");
//       if (!userId) throw new Error("User ID not found");

//       if (selectedContact.type === "group") {
//         const callId = generateUUID();
//         const participantIds = selectedContact.groupDetails?.members
//           .map((m) => m.userId)
//           .filter((id) => id !== userId) || [];
//         console.log(`Initiating group video call, callId: ${callId}, participants:`, participantIds);
//         await webrtcService.initiateGroupCall(selectedContact.groupId!, "video", participantIds);
//         const stream = webrtcService.cachedLocalStream;
//         setLocalStream(stream);
//         setGroupCallId(callId);
//         socketService.sendGroupCallOffer({
//           groupId: selectedContact.groupId!,
//           offer: await webrtcService.createOffer(userId),
//           callerId: userId,
//           callType: "video",
//           callId,
//         });
//       } else if (selectedContact.type === "user-user") {
//         await webrtcService.initOneOnOneCall("video");
//         const stream = webrtcService.cachedLocalStream;
//         setLocalStream(stream);
//         const offer = await webrtcService.createOffer();
//         socketService.sendOffer(targetId, selectedContact.type, chatKey, offer, "video");
//       } else {
//         throw new Error("Unsupported contact type");
//       }
//       setupWebRTCListeners();
//       if (toggleDetailsSidebar) {
//         toggleDetailsSidebar();
//       }
//       setIsVideoCallActive(true);
//       console.log("Video call started successfully");
//     } catch (error) {
//       console.error("Error starting video call:", error);
//       alert("Failed to start video call. Check permissions.");
//       webrtcService.stop();
//       setLocalStream(null);
//       setRemoteStreams(new Map());
//       setIsVideoCallActive(false);
//       setGroupCallId(null);
//     } finally {
//       setIsStartingCall(false);
//     }
//   };

//   // Start audio call
//   const startAudioCall = async () => {
//     if (!selectedContact) {
//       console.log("No contact selected for audio call");
//       return;
//     }
//     if (isStartingCall) {
//       console.log("Audio call already in progress");
//       return;
//     }
//     setIsStartingCall(true);
//     try {
//       console.log("Starting audio call for contact:", selectedContact.id);
//       const chatKey = getChatKey(selectedContact);
//       const targetId = selectedContact.targetId || selectedContact.groupId || "";
//       const userId = localStorage.getItem("userId");
//       if (!userId) throw new Error("User ID not found");

//       if (selectedContact.type === "group") {
//         const callId = generateUUID();
//         const participantIds = selectedContact.groupDetails?.members
//           .map((m) => m.userId)
//           .filter((id) => id !== userId) || [];
//         console.log(`Initiating group audio call, callId: ${callId}, participants:`, participantIds);
//         await webrtcService.initiateGroupCall(selectedContact.groupId!, "audio", participantIds);
//         const stream = webrtcService.cachedLocalStream;
//         setLocalStream(stream);
//         setGroupCallId(callId);
//         socketService.sendGroupCallOffer({
//           groupId: selectedContact.groupId!,
//           offer: await webrtcService.createOffer(userId),
//           callerId: userId,
//           callType: "audio",
//           callId,
//         });
//       } else if (selectedContact.type === "user-user") {
//         await webrtcService.initOneOnOneCall("audio");
//         const stream = webrtcService.cachedLocalStream;
//         setLocalStream(stream);
//         const offer = await webrtcService.createOffer();
//         socketService.sendOffer(targetId, selectedContact.type, chatKey, offer, "audio");
//       } else {
//         throw new Error("Unsupported contact type");
//       }
//       setupWebRTCListeners();
//       if (toggleDetailsSidebar) {
//         toggleDetailsSidebar();
//       }
//       setIsAudioCallActive(true);
//       console.log("Audio call started successfully");
//     } catch (error) {
//       console.error("Error starting audio call:", error);
//       alert("Failed to start audio call. Check permissions.");
//       webrtcService.stop();
//       setLocalStream(null);
//       setRemoteStreams(new Map());
//       setIsAudioCallActive(false);
//       setGroupCallId(null);
//     } finally {
//       setIsStartingCall(false);
//     }
//   };

//   // Accept incoming call
//   const acceptCall = async () => {
//     if (!selectedContact || !incomingCallData) {
//       console.log("Cannot accept call: Missing contact or call data");
//       return;
//     }
//     try {
//       console.log(`Accepting ${incomingCallData.callType} call from:`, incomingCallData.userId);
//       const chatKey = getChatKey(selectedContact);
//       const userId = localStorage.getItem("userId");
//       if (!userId) throw new Error("User ID not found");

//       if (incomingCallData.type === "group") {
//         if (!incomingCallData.callId || !selectedContact.groupId) {
//           throw new Error("Missing callId or groupId");
//         }
//         const stream = incomingCallData.callType === "audio"
//           ? await webrtcService.getLocalAudioStream()
//           : await webrtcService.getLocalStream();
//         setLocalStream(stream);
//         const answer = await webrtcService.createAnswer(incomingCallData.userId);
//         socketService.sendGroupCallAnswer({
//           groupId: selectedContact.groupId,
//           answer,
//           answererId: userId,
//           callerId: incomingCallData.userId,
//           callType: incomingCallData.callType,
//           callId: incomingCallData.callId,
//         });
//         setGroupCallId(incomingCallData.callId);
//       } else {
//         await webrtcService.initOneOnOneCall(incomingCallData.callType);
//         await webrtcService.setRemoteDescription(incomingCallData.offer);
//         const stream = webrtcService.cachedLocalStream;
//         setLocalStream(stream);
//         const answer = await webrtcService.createAnswer();
//         socketService.sendAnswer(
//           incomingCallData.userId,
//           selectedContact.type,
//           chatKey,
//           answer,
//           incomingCallData.callType
//         );
//       }
//       setupWebRTCListeners();
//       const queue = iceCandidateQueue.current.get(incomingCallData.userId) || [];
//       while (queue.length > 0) {
//         const candidate = queue.shift();
//         if (candidate) {
//           console.log("Applying queued ICE candidate:", candidate);
//           await webrtcService.addIceCandidate(candidate, incomingCallData.userId);
//         }
//       }
//       iceCandidateQueue.current.set(incomingCallData.userId, queue);
//       setIsIncomingCall(false);
//       setIncomingCallData(null);
//       if (incomingCallData.callType === "audio") {
//         setIsAudioCallActive(true);
//       } else {
//         setIsVideoCallActive(true);
//       }
//       setIsCallTerminated(false);
//       console.log(`${incomingCallData.callType} call accepted`);
//     } catch (error) {
//       console.error(`Error accepting call:`, error);
//       alert(`Failed to accept call. Check permissions.`);
//       webrtcService.stop();
//       setIsIncomingCall(false);
//       setIncomingCallData(null);
//       setLocalStream(null);
//       setRemoteStreams(new Map());
//       setGroupCallId(null);
//     }
//   };

//   // Decline incoming call
//   const declineCall = () => {
//     if (!selectedContact || !incomingCallData || isCallTerminated || !isIncomingCall) {
//       console.log("Cannot decline call: Missing data or terminated");
//       return;
//     }
//     console.log(`Declining ${incomingCallData.callType} call from:`, incomingCallData.userId);
//     if (ringtone.current) {
//       ringtone.current.pause();
//       ringtone.current.currentTime = 0;
//       isRingtonePlaying.current = false;
//     }
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       console.error("User ID not found");
//       return;
//     }
//     if (incomingCallData.type === "group" && incomingCallData.callId && selectedContact.groupId) {
//       socketService.sendGroupCallEnded({
//         groupId: selectedContact.groupId,
//         userId,
//         callType: incomingCallData.callType,
//         callId: incomingCallData.callId,
//       });
//     } else {
//       socketService.emitCallEnded(
//         incomingCallData.userId,
//         selectedContact.type,
//         incomingCallData.chatKey,
//         incomingCallData.callType
//       );
//     }
//     setIsIncomingCall(false);
//     setIncomingCallData(null);
//     setIsCallTerminated(true);
//     webrtcService.stop();
//     setLocalStream(null);
//     setRemoteStreams(new Map());
//     setGroupCallId(null);
//   };

//   // End video call
//   const endVideoCall = () => {
//     if (!selectedContact) return;
//     console.log("Ending video call");
//     webrtcService.stop();
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }
//     remoteVideoRefs.current.forEach((ref) => {
//       if (ref) ref.srcObject = null;
//     });
//     setLocalStream(null);
//     setRemoteStreams(new Map());
//     setIsVideoCallActive(false);
//     setIsAudioMuted(false);
//     setIsVideoOff(false);
//     setIsScreenSharing(false);
//     setHasProcessedAnswer({});
//     setIsCallTerminated(true);
//     const chatKey = getChatKey(selectedContact);
//     const targetId = selectedContact.targetId || selectedContact.groupId || "";
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       console.error("User ID not found");
//       return;
//     }
//     if (selectedContact.type === "group" && groupCallId) {
//       socketService.sendGroupCallEnded({
//         groupId: selectedContact.groupId!,
//         userId,
//         callType: "video",
//         callId: groupCallId,
//       });
//     } else {
//       socketService.emitCallEnded(targetId, selectedContact.type, chatKey, "video");
//     }
//     setGroupCallId(null);
//     console.log("Video call ended");
//   };

//   // End audio call
//   const endAudioCall = () => {
//     if (!selectedContact) return;
//     console.log("Ending audio call");
//     webrtcService.stop();
//     if (localAudioRef.current) {
//       localAudioRef.current.srcObject = null;
//     }
//     remoteAudioRefs.current.forEach((ref) => {
//       if (ref) ref.srcObject = null;
//     });
//     setLocalStream(null);
//     setRemoteStreams(new Map());
//     setIsAudioCallActive(false);
//     setIsAudioMuted(false);
//     setHasProcessedAnswer({});
//     setIsCallTerminated(true);
//     const chatKey = getChatKey(selectedContact);
//     const targetId = selectedContact.targetId || selectedContact.groupId || "";
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       console.error("User ID not found");
//       return;
//     }
//     if (selectedContact.type === "group" && groupCallId) {
//       socketService.sendGroupCallEnded({
//         groupId: selectedContact.groupId!,
//         userId,
//         callType: "audio",
//         callId: groupCallId,
//       });
//     } else {
//       socketService.emitCallEnded(targetId, selectedContact.type, chatKey, "audio");
//     }
//     setGroupCallId(null);
//     console.log("Audio call ended");
//   };

//   // Get participant name for group calls
//   const getParticipantName = (userId: string) => {
//     if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
//       return selectedContact.groupDetails.members.find((m) => m.userId === userId)?.name || userId;
//     }
//     return userId;
//   };

//   return (
//     <div className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r ${getGradient()} text-white rounded-t-xl shadow-md z-[150]`}>
//       {/* Left: Sidebar toggle and contact info */}
//       <div className="flex items-center gap-2 sm:gap-3">
//         {(isMobileView || type) && (
//           <Button
//             isIconOnly
//             variant="light"
//             onPress={type ? () => navigate("/chat") : toggleSidebar}
//             className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
//             aria-label={type ? "Go back" : "Toggle sidebar"}
//           >
//             {type ? <FaArrowLeft size={16} /> : <FaBars size={16} />}
//           </Button>
//         )}
//         {selectedContact && (
//           <div className="flex items-center gap-2 sm:gap-3">
//             <Avatar
//               src={selectedContact.profilePic}
//               className="border-2 border-white w-8 h-8 sm:w-10 sm:h-10"
//               size="sm"
//               isBordered
//               color={
//                 selectedContact.type === "user-mentor" ? "primary" :
//                 selectedContact.type === "group" ? "success" : "secondary"
//               }
//             />
//             <div>
//               <h2 className="text-base sm:text-lg font-bold truncate max-w-[150px] sm:max-w-[200px]">
//                 {selectedContact.name}
//               </h2>
//               {getTypingIndicator() || (
//                 <p className="text-xs text-white/80 truncate max-w-[150px] sm:max-w-[200px]">
//                   {selectedContact.type === "user-mentor" ? "Mentorship" :
//                    selectedContact.type === "group" ? `${selectedContact.groupDetails?.members.length || 0} members` :
//                    selectedContact.targetJobTitle || "Connection"}
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//         {!selectedContact && (
//           <h2 className="text-base sm:text-lg font-bold">Select a conversation</h2>
//         )}
//       </div>
//       {/* Right: Call and menu buttons */}
//       {selectedContact && (
//         <div className="flex items-center gap-1 sm:gap-2">
//           <Tooltip content={isAudioCallActive ? "End audio call" : "Voice call"} placement="bottom">
//             <Button
//               isIconOnly
//               variant="flat"
//               className="bg-white/20 text-white hover:bg-white/30 w-8 h-8 sm:w-10 sm:h-10"
//               onPress={isAudioCallActive ? endAudioCall : startAudioCall}
//               aria-label={isAudioCallActive ? "End audio call" : "Start audio call"}
//               disabled={isStartingCall}
//             >
//               <FaPhone size={14} />
//             </Button>
//           </Tooltip>
//           <Tooltip content={isVideoCallActive ? "End video call" : "Video call"} placement="bottom">
//             <Button
//               isIconOnly
//               variant="flat"
//               className="bg-white/20 text-white hover:bg-white/30 w-8 h-8 sm:w-10 sm:h-10"
//               onPress={isVideoCallActive ? endVideoCall : startVideoCall}
//               aria-label={isVideoCallActive ? "End video call" : "Start video call"}
//               disabled={isStartingCall}
//             >
//               <FaVideo size={14} />
//             </Button>
//           </Tooltip>
//           <Dropdown>
//             <DropdownTrigger>
//               <Button
//                 isIconOnly
//                 variant="flat"
//                 className="bg-white/20 text-white hover:bg-white/30 w-8 h-8 sm:w-10 sm:h-10"
//                 aria-label="More options"
//               >
//                 <FaEllipsisV size={14} />
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu aria-label="Chat options">
//               <DropdownItem
//                 key="info"
//                 startContent={<FaInfoCircle />}
//                 onPress={toggleDetailsSidebar}
//               >
//                 {isMobileView ? "Contact Info" : "Toggle Info Panel"}
//               </DropdownItem>
//               {selectedContact.type === "group" && (
//                 <DropdownItem key="members" startContent={<FaUserFriends />}>
//                   View Members
//                 </DropdownItem>
//               )}
//             </DropdownMenu>
//           </Dropdown>
//         </div>
//       )}
//       {/* Video call UI */}
//       {isVideoCallActive && (
//         <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
//             <div className="bg-gray-900 rounded">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-48 sm:h-64 object-cover bg-black rounded"
//               />
//               <p className="text-white text-center mt-1">You</p>
//             </div>
//             {selectedContact?.type === "group" ? (
//               Array.from(remoteStreams.entries()).map(([userId, stream]) => (
//                 <div key={userId} className="bg-gray-900 rounded">
//                   <video
//                     autoPlay
//                     playsInline
//                     ref={(el) => {
//                       if (el) {
//                         el.srcObject = stream;
//                         remoteVideoRefs.current.set(userId, el);
//                       }
//                     }}
//                     className="w-full h-48 sm:h-64 object-cover bg-black rounded"
//                   />
//                   <p className="text-white text-center mt-1">{getParticipantName(userId)}</p>
//                 </div>
//               ))
//             ) : (
//               <div className="bg-gray-900 rounded">
//                 <video
//                   autoPlay
//                   playsInline
//                   ref={(el) => {
//                     if (el) {
//                       el.srcObject = Array.from(remoteStreams.values())[0] || null;
//                       remoteVideoRefs.current.set("remote", el);
//                     }
//                   }}
//                   className="w-full h-48 sm:h-64 object-cover bg-black rounded"
//                 />
//                 <p className="text-white text-center mt-1">Remote</p>
//               </div>
//             )}
//           </div>
//           <div className="flex gap-2 mt-4">
//             <Tooltip content={isAudioMuted ? "Unmute" : "Mute"} placement="top">
//               <Button
//                 isIconOnly
//                 color={isAudioMuted ? "danger" : "primary"}
//                 onPress={toggleAudio}
//                 aria-label={isAudioMuted ? "Unmute" : "Mute"}
//               >
//                 {isAudioMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
//               </Button>
//             </Tooltip>
//             <Tooltip content={isVideoOff ? "Turn video on" : "Turn video off"} placement="top">
//               <Button
//                 isIconOnly
//                 color={isVideoOff ? "danger" : "primary"}
//                 onPress={toggleVideo}
//                 aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
//               >
//                 {isVideoOff ? <FaVideoSlash size={16} /> : <FaVideo size={16} />}
//               </Button>
//             </Tooltip>
//             <Tooltip content={isScreenSharing ? "Stop sharing" : "Share screen"} placement="top">
//               <Button
//                 isIconOnly
//                 color={isScreenSharing ? "danger" : "primary"}
//                 onPress={toggleScreenShare}
//                 aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
//               >
//                 <FaDesktop size={16} />
//               </Button>
//             </Tooltip>
//             <Button
//               color="danger"
//               onPress={endVideoCall}
//               className="px-3"
//             >
//               End Call
//             </Button>
//           </div>
//         </div>
//       )}
//       {/* Audio call UI */}
//       {isAudioCallActive && (
//         <div className="fixed inset-0 bg-black z-[2000] flex flex-col items-center justify-center p-4">
//           <div className="flex flex-col items-center gap-4 w-full max-w-md">
//             <div className="bg-gray-900 rounded-lg p-4 w-full text-center">
//               <p className="text-white text-lg font-semibold">
//                 Audio Call with {selectedContact?.type === "group" ? selectedContact.name : selectedContact?.name || "Unknown"}
//               </p>
//               <audio ref={localAudioRef} autoPlay muted />
//               {selectedContact?.type === "group" ? (
//                 Array.from(remoteStreams.entries()).map(([userId, stream]) => (
//                   <audio
//                     key={userId}
//                     autoPlay
//                     ref={(el) => {
//                       if (el) {
//                         el.srcObject = stream;
//                         remoteAudioRefs.current.set(userId, el);
//                       }
//                     }}
//                   />
//                 ))
//               ) : (
//                 <audio
//                   autoPlay
//                   ref={(el) => {
//                     if (el) {
//                       el.srcObject = Array.from(remoteStreams.values())[0] || null;
//                       remoteAudioRefs.current.set("remote", el);
//                     }
//                   }}
//                 />
//               )}
//             </div>
//             <div className="flex gap-2">
//               <Tooltip content={isAudioMuted ? "Unmute" : "Mute"} placement="top">
//                 <Button
//                   isIconOnly
//                   color={isAudioMuted ? "danger" : "primary"}
//                   onPress={toggleAudio}
//                   aria-label={isAudioMuted ? "Unmute" : "Mute"}
//                 >
//                   {isAudioMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
//                 </Button>
//               </Tooltip>
//               <Button
//                 color="danger"
//                 onPress={endAudioCall}
//                 className="px-3"
//               >
//                 End Call
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Incoming call modal */}
//       <Modal isOpen={isIncomingCall} onClose={declineCall}>
//         <ModalContent>
//           <ModalHeader>Incoming {incomingCallDetails?.callType === "audio" ? "Audio" : "Video"} Call</ModalHeader>
//           <ModalBody>
//             <p>Call from {incomingCallDetails?.callerName || "Unknown"}</p>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={declineCall}>
//               Decline
//             </Button>
//             <Button color="primary" onPress={acceptCall}>
//               Accept
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default ChatHeader;