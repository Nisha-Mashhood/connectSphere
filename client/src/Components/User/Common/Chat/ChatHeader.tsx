import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { Button, Tooltip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { FaArrowLeft, FaPhone, FaVideo, FaBars, FaEllipsisV, FaUserFriends, FaInfoCircle, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaDesktop } from "react-icons/fa";
import { Contact } from "../../../../types";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";
import toast from "react-hot-toast";

const GroupCall = lazy(() => import("./GroupCall"));

const webrtcService = new WebRTCService();

interface ChatHeaderProps {
  type?: string;
  selectedContact: Contact | null;
  navigate: (path: string) => void;
  toggleSidebar?: () => void;
  toggleDetailsSidebar?: () => void;
  isMobileView?: boolean;
  typingUsers: { [key: string]: string[] };
  getChatKey: (contact: Contact) => string;
  isVideoCallActive: boolean;
  setIsVideoCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  incomingCallDetails: { userId: string; chatKey: string; callType: "audio" | "video"; callerName: string } | null;
  ringtone: React.MutableRefObject<HTMLAudioElement>;
  playRingtone: () => Promise<void>;
  isRingtonePlaying: React.MutableRefObject<boolean>;
}

//  const isCurrentTimeInSlot = (
//   selectedContact: Contact | null,
//   currentTime: Date = new Date()
// ): boolean => {
  //SLOT VALIDATION 
  // if (!selectedContact || selectedContact.type === 'user-user') {
  //   return true;
  // }

  // const slots =
  //   selectedContact.type === 'user-mentor'
  //     ? selectedContact.collaborationDetails?.selectedSlot
  //     : selectedContact.groupDetails?.availableSlots;

  // if (!slots || slots.length === 0) {
  //   return true; // No slots defined, allow calls
  // }

  // const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  // const currentHours = currentTime.getHours();
  // const currentMinutes = currentTime.getMinutes();
  // const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // const matchingSlot = slots.find((slot) => slot.day === currentDay);

  // if (!matchingSlot) {
  //   return false; // No slot for current day
  // }

//   const isInSlot = matchingSlot.timeSlots.some((timeSlot) => {
//     try {
//       const [start, end] = timeSlot.split('-').map((time) => {
//         if (!/^\d{2}:\d{2}$/.test(time)) {
//           throw new Error(`Invalid time format: ${time}`);
//         }
//         const [hours, minutes] = time.split(':').map(Number);
//         if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
//           throw new Error(`Invalid time values: ${time}`);
//         }
//         return hours * 60 + minutes;
//       });
//       return currentTimeInMinutes >= start && currentTimeInMinutes <= end;
//     } catch (error) {
//       console.error('Error parsing time slot:', error);
//       return true; // Allow calls on invalid slot format 
//     }
//   });

//   return isInSlot;
// };

const ChatHeader: React.FC<ChatHeaderProps> = ({
  type,
  selectedContact,
  navigate,
  toggleSidebar,
  toggleDetailsSidebar,
  isMobileView,
  typingUsers,
  getChatKey,
  isVideoCallActive,
  setIsVideoCallActive,
  incomingCallDetails,
  ringtone,
  playRingtone,
  isRingtonePlaying,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{
    userId: string;
    targetId: string;
    type: string;
    chatKey: string;
    offer: RTCSessionDescriptionInit;
    callType: "audio" | "video";
  } | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasProcessedAnswer, setHasProcessedAnswer] = useState(false);
  const [isCallTerminated, setIsCallTerminated] = useState(false);
  const groupCallRef = useRef<{ startGroupCall: (type: 'audio' | 'video') => void } | null>(null);
  // const [isCallEnabled, setIsCallEnabled] = useState(true);

  // // Update call enabled status every minute for slot validation
  // useEffect(() => {
  //   const checkCallEnabled = () => {
  //     //SLOT VALIDATION
  //     // const enabled = isCurrentTimeInSlot(selectedContact);
  //     const enabled = true;
  //     setIsCallEnabled(enabled);
  //   };
  //   checkCallEnabled(); // Initial check
  //   const interval = setInterval(checkCallEnabled, 60 * 1000); // Check every minute

  //   return () => clearInterval(interval);
  // }, [selectedContact]);


  // Common WebRTC utility functions for one-on-one calls
  const initWebRTC = useCallback(async () => {
    const peerConnection = webrtcService.getPeerConnection();
    if (!peerConnection || peerConnection.connectionState === "closed") {
      console.log("Initializing WebRTC peer connection");
      await webrtcService.initPeerConnection();
    }
    const newPeerConnection = webrtcService.getPeerConnection();
    if (newPeerConnection) {
      newPeerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log("Received remote stream, track details:", remoteStream.getTracks());
        setRemoteStream(remoteStream);
      };
      newPeerConnection.onicecandidate = (event) => {
        if (event.candidate && selectedContact) {
          console.log("Sending ICE candidate:", event.candidate);
          const targetId = selectedContact.targetId || selectedContact.groupId || "";
          const callType = isAudioCallActive ? "audio" : "video";
          socketService.sendIceCandidate(targetId, selectedContact.type, getChatKey(selectedContact), event.candidate, callType);
        }
      };
      newPeerConnection.onicecandidateerror = (event) => {
        console.error("ICE candidate error:", {
          address: event.address,
          port: event.port,
          url: event.url,
          errorCode: event.errorCode,
          errorText: event.errorText,
        });
        // toast.error("ICE candidate error occurred");
      };
    }
  }, [selectedContact, getChatKey, isAudioCallActive]);

  const stopWebRTC = useCallback(() => {
    console.log("Stopping WebRTC service");
    webrtcService.stop();
    setLocalStream(null);
    setRemoteStream(null);
    setHasProcessedAnswer(false);
  }, []);

  const endAudioCall = useCallback(() => {
    if (!selectedContact) return;
    console.log("Ending audio call");
    stopWebRTC();
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setIsAudioCallActive(false);
    setIsAudioMuted(false);
    setIsCallTerminated(true);
    const chatKey = getChatKey(selectedContact);
    const targetId = selectedContact.targetId || selectedContact.groupId || "";
    socketService.emitCallEnded(targetId, selectedContact.type, chatKey, "audio");
    // toast.success("Audio call ended");
  }, [getChatKey, selectedContact, stopWebRTC]);

  const endVideoCall = useCallback(() => {
    if (!selectedContact) return;
    console.log("Ending video call");
    stopWebRTC();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsVideoCallActive(false);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsCallTerminated(true);
    const chatKey = getChatKey(selectedContact);
    const targetId = selectedContact.targetId || selectedContact.groupId || "";
    socketService.emitCallEnded(targetId, selectedContact.type, chatKey, "video");
    // toast.success("Video call ended");
  }, [getChatKey, selectedContact, setIsVideoCallActive, stopWebRTC]);

  const declineCall = useCallback(() => {
    if (!selectedContact || !incomingCallData || isCallTerminated || !isIncomingCall) {
      console.log("Cannot decline call: Missing data or already terminated");
      return;
    }
    console.log(`Declining ${incomingCallData.callType} call from:`, incomingCallData.userId);
    if (ringtone.current) {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
      isRingtonePlaying.current = false;
    }
    socketService.emitCallEnded(
      incomingCallData.userId,
      selectedContact.type,
      incomingCallData.chatKey,
      incomingCallData.callType
    );
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setIsCallTerminated(true);
    stopWebRTC();
    // toast.error(`${incomingCallData.callType.charAt(0).toUpperCase() + incomingCallData.callType.slice(1)} call declined`);
  }, [incomingCallData, isCallTerminated, isIncomingCall, isRingtonePlaying, ringtone, selectedContact, stopWebRTC]);

  // WebRTC and socket setup for one-on-one calls
  useEffect(() => {
    if (!selectedContact || selectedContact.type === "group") {
      console.log('Skipping WebRTC and socket setup for group or no contact', { selectedContact });
      return;
    }

    console.log("Setting up WebRTC for one-on-one call, contact:", selectedContact.id);
    initWebRTC().catch((err) => {
      console.error("Error initializing WebRTC:", err);
      // toast.error("Failed to initialize WebRTC");
    });

    const chatKey = getChatKey(selectedContact);

    const handleOffer = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      senderName: string;
    }) => {
      if (data.chatKey === chatKey && !isVideoCallActive && !isAudioCallActive) {
        console.log(`Incoming ${data.callType} call offer:`, data);
        setIncomingCallData(data);
        setIsIncomingCall(true);
        setIsCallTerminated(false);
        // toast(`Incoming ${data.callType} call from ${data.senderName}`, { duration: 30000 });
      }
    };

    const handleAnswer = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      answer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    }) => {
      if (data.chatKey === chatKey && !hasProcessedAnswer) {
        console.log(`Received ${data.callType} answer:`, data);
        const peerConnection = webrtcService.getPeerConnection();
        if (peerConnection && peerConnection.signalingState !== "have-local-offer") {
          console.warn(`Cannot set remote answer: Invalid signaling state (${peerConnection.signalingState})`);
          // toast.error("Invalid signaling state for answer");
          return;
        }
        setHasProcessedAnswer(true);
        webrtcService.setRemoteDescription(data.answer).then(() => {
          console.log("Remote answer set successfully, applying queued ICE candidates");
          while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) {
              console.log("Applying queued ICE candidate after answer:", candidate);
              webrtcService.addIceCandidate(candidate).catch((error) => {
                console.error("Error applying queued ICE candidate:", error);
                // toast.error("Failed to apply ICE candidate");
              });
            }
          }
        }).catch((error) => {
          console.error("Error setting remote description for answer:", error);
          // toast.error("Failed to set remote answer");
        });
      }
    };

    const handleIceCandidate = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      candidate: RTCIceCandidateInit;
      callType: "audio" | "video";
    }) => {
      if (data.chatKey === chatKey) {
        console.log(`Received ${data.callType} ICE candidate:`, data);
        if (!webrtcService.getPeerConnection()) {
          console.log("Queuing ICE candidate: peer connection not initialized");
          iceCandidateQueue.current.push(new RTCIceCandidate(data.candidate));
          return;
        }
        if (!webrtcService.hasRemoteDescription()) {
          console.log("Queuing ICE candidate: remote description not set");
          iceCandidateQueue.current.push(new RTCIceCandidate(data.candidate));
          return;
        }
        webrtcService.addIceCandidate(new RTCIceCandidate(data.candidate)).catch((error) => {
          console.error("Error adding ICE candidate:", error);
          // toast.error("Failed to add ICE candidate");
        });
      }
    };

    const handleCallEnded = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      callType: "audio" | "video";
    }) => {
      if (data.chatKey === chatKey) {
        console.log(`Received callEnded for ${data.callType} call:`, data);
        if (data.callType === "video") {
          endVideoCall();
        } else {
          endAudioCall();
        }
        setIsIncomingCall(false);
        setIncomingCallData(null);
        // toast.success(`${data.callType.charAt(0).toUpperCase() + data.callType.slice(1)} call ended`);
      }
    };

    const handleNotificationNew = (notification: {
      _id: string;
      userId: string;
      type: "message" | "incoming_call" | "missed_call";
      content: string;
      relatedId: string;
      status: "unread" | "read";
      senderId: string;
      createdAt: string;
      updatedAt: string;
    }) => {
      if (notification.relatedId === chatKey && notification.type === "missed_call") {
        console.log("Received missed call notification:", notification);
        // toast.error(notification.content, { duration: 5000 });
      }
    };

    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallEnded(handleCallEnded);
    socketService.onNotificationNew(handleNotificationNew);

    return () => {
      console.log("Cleaning up socket listeners for chatKey:", chatKey);
      socketService.socket?.off("offer", handleOffer);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("ice-candidate", handleIceCandidate);
      socketService.socket?.off("callEnded", handleCallEnded);
      socketService.socket?.off("notification.new", handleNotificationNew);
    };
  }, [selectedContact, getChatKey, hasProcessedAnswer, endAudioCall, endVideoCall, isAudioCallActive, isVideoCallActive, initWebRTC]);

  // Stop ringtone when modal closes
  useEffect(() => {
    if (!isIncomingCall && ringtone.current && ringtone.current.currentTime > 0) {
      console.log("Modal closed, stopping ringtone");
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
      isRingtonePlaying.current = false;
    }
  }, [isIncomingCall, ringtone, isRingtonePlaying]);

  // Play ringtone for incoming calls
  useEffect(() => {
    if (isIncomingCall && incomingCallData && selectedContact?.type !== "group") {
      console.log("Incoming call detected, attempting to play ringtone");
      playRingtone().catch((error) => {
        console.error("Auto-play ringtone failed:", error);
        if (error.name === "NotAllowedError") {
          toast.error("Please click the 'Enable Audio' button to hear the ringtone.", { duration: 5000 });
        }
      });
    }
  }, [isIncomingCall, incomingCallData, playRingtone, selectedContact]);

  // Auto-decline incoming call after 30 seconds
  useEffect(() => {
    let timeout: number;
    if (isIncomingCall && incomingCallData && selectedContact) {
      timeout = setTimeout(() => {
        console.log(`Auto-declining ${incomingCallData.callType} call after 30 seconds`);
        declineCall();
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [isIncomingCall, incomingCallData, selectedContact, declineCall]);

  // Cleanup WebRTC on component unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up WebRTC service on unmount");
      stopWebRTC();
      setIsAudioCallActive(false);
      setIsVideoCallActive(false);
      setIsAudioMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
    };
  }, [stopWebRTC, setIsVideoCallActive]);

  // Assign streams to audio/video elements
  useEffect(() => {
    if (isVideoCallActive && localStream && localVideoRef.current && selectedContact?.type !== "group") {
      console.log("useEffect: Assigning local video stream, tracks:", localStream.getTracks());
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().then(() => {
        console.log("Local video playing successfully");
      }).catch((err) => {
        console.error("Error playing local video:", err);
        // toast.error("Failed to play local video");
      });
    }
    if (isVideoCallActive && remoteStream && remoteVideoRef.current && selectedContact?.type !== "group") {
      console.log("useEffect: Assigning remote video stream, tracks:", remoteStream.getTracks());
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().then(() => {
        console.log("Remote video playing successfully");
      }).catch((err) => {
        console.error("Error playing remote video:", err);
        // toast.error("Failed to play remote video");
      });
    }
    if (isAudioCallActive && localStream && localAudioRef.current && selectedContact?.type !== "group") {
      console.log("useEffect: Assigning local audio stream, tracks:", localStream.getTracks());
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.play().then(() => {
        console.log("Local audio playing successfully");
      }).catch((err) => {
        console.error("Error playing local audio:", err);
        // toast.error("Failed to play local audio");
      });
    }
    if (isAudioCallActive && remoteStream && remoteAudioRef.current && selectedContact?.type !== "group") {
      console.log("useEffect: Assigning remote audio stream, tracks:", remoteStream.getTracks());
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().then(() => {
        console.log("Remote audio playing successfully");
      }).catch((err) => {
        console.error("Error playing remote audio:", err);
        // toast.error("Failed to play remote audio");
      });
    }
  }, [isVideoCallActive, isAudioCallActive, localStream, remoteStream, selectedContact]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        console.log("Audio track toggled:", audioTrack.enabled ? "unmuted" : "muted");
        // toast.success(audioTrack.enabled ? "Microphone unmuted" : "Microphone muted");
      } else {
        console.warn("No audio track available to toggle");
        toast.error("No audio track available");
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log("Video track toggled:", videoTrack.enabled ? "on" : "off");
        // toast.success(videoTrack.enabled ? "Video turned on" : "Video turned off");
      } else {
        console.warn("No video track available to toggle");
        toast.error("No video track available");
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!webrtcService || !localStream) {
      console.warn("Cannot toggle screen share: WebRTC service or local stream missing");
      toast.error("Cannot toggle screen share");
      return;
    }
    if (isScreenSharing) {
      const videoTrack = localStream.getVideoTracks()[0];
      const peerConnection = webrtcService.getPeerConnection();
      if (peerConnection && videoTrack) {
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
          console.log("Screen sharing stopped, reverted to camera");
          toast.success("Screen sharing stopped");
        }
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const peerConnection = webrtcService.getPeerConnection();
        if (peerConnection) {
          const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(screenTrack);
            console.log("Screen sharing started");
            // toast.success("Screen sharing started");
          }
        }
        screenTrack.onended = () => {
          const videoTrack = localStream.getVideoTracks()[0];
          if (peerConnection && videoTrack) {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(videoTrack);
              console.log("Screen sharing ended by user, reverted to camera");
              toast.success("Screen sharing ended");
            }
          }
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error starting screen share:", error);
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          toast.error("Screen sharing permission denied. Please allow screen sharing in your browser.");
        } else {
          toast.error("Failed to start screen sharing");
        }
      }
    }
  };

  const getGradient = () => {
    if (!selectedContact) return "from-violet-500 to-fuchsia-500";
    switch (selectedContact.type) {
      case "user-mentor":
        return "from-blue-500 to-cyan-400";
      case "user-user":
        return "from-purple-500 to-pink-500";
      case "group":
        return "from-emerald-500 to-teal-400";
      default:
        return "from-violet-500 to-fuchsia-500";
    }
  };

  const getTypingIndicator = () => {
    if (!selectedContact) return null;
    const chatKey = getChatKey(selectedContact);
    const typingUserIds = typingUsers[chatKey] || [];
    if (typingUserIds.length === 0) return null;
    const typingUsersNames = typingUserIds
      .map((userId) => {
        let memberName: string | undefined;
        if (selectedContact.type === "group" && selectedContact.groupDetails?.members) {
          const member = selectedContact.groupDetails.members.find((m) => m.userId === userId);
          memberName = member?.name;
        } else if (selectedContact.type === "user-mentor" && selectedContact.collaborationDetails) {
          if (selectedContact.userId === userId) {
            memberName = selectedContact.collaborationDetails.userName;
          } else if (selectedContact.contactId === userId) {
            memberName = selectedContact.collaborationDetails.mentorName;
          }
        } else if (selectedContact.type === "user-user") {
          if (selectedContact.userId === userId) {
            memberName = selectedContact.connectionDetails.requesterName;
          } else if (selectedContact.contactId === userId) {
            memberName = selectedContact.connectionDetails.recipientName;
          }
        }
        return memberName || " ";
      })
      .filter(Boolean)
      .join(", ");
    if (!typingUsersNames) return null;
    return (
      <p className="text-xs text-green-200 animate-pulse">
        ... {typingUsersNames}
        {typingUsersNames.includes(",") ? "   " : "   "}
        typing
      </p>
    );
  };

  const startVideoCall = async () => {
    if (!selectedContact) {
      console.log("No contact selected for video call");
      toast.error("No contact selected");
      return;
    }
    if (selectedContact.type === "group" && groupCallRef.current) {
      console.log("Starting group video call");
      groupCallRef.current.startGroupCall("video");
      return;
    }

    //SLOT VALIDATION
    // if (!isCurrentTimeInSlot(selectedContact)) {
    //   console.log('Video call attempted outside scheduled slot');
    //   toast.error('Video calls are only available during scheduled slots');
    //   return;
    // }

    try {
      console.log("Starting one-on-one video call for contact:", selectedContact.id);
      await initWebRTC();
      const stream = await webrtcService.getLocalStream();
      setLocalStream(stream);
      if (toggleDetailsSidebar) {
        console.log("Closing details sidebar for video call");
        toggleDetailsSidebar();
      }
      const chatKey = getChatKey(selectedContact);
      const targetId = selectedContact.targetId || selectedContact.groupId || "";
      const offer = await webrtcService.createOffer();
      socketService.sendOffer(targetId, selectedContact.type, chatKey, offer, "video");
      setIsVideoCallActive(true);
      // toast.success("Video call started");
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Failed to start video call. Check camera/microphone permissions.");
      setIsVideoCallActive(false);
      setLocalStream(null);
    }
  };

  const startAudioCall = async () => {
    if (!selectedContact) {
      console.log("No contact selected for audio call");
      toast.error("No contact selected");
      return;
    }
    if (selectedContact.type === "group" && groupCallRef.current) {
      console.log("Starting group audio call");
      groupCallRef.current.startGroupCall("audio");
      return;
    }

    //SLOT VALIDATION 
    // if (!isCurrentTimeInSlot(selectedContact)) {
    //   console.log('Audio call attempted outside scheduled slot');
    //   toast.error('Audio calls are only available during scheduled slots');
    //   return;
    // }

    try {
      console.log("Starting one-on-one audio call for contact:", selectedContact.id);
      await initWebRTC();
      const stream = await webrtcService.getLocalAudioStream();
      setLocalStream(stream);
      if (toggleDetailsSidebar) {
        console.log("Closing details sidebar for audio call");
        toggleDetailsSidebar();
      }
      const chatKey = getChatKey(selectedContact);
      const targetId = selectedContact.targetId || selectedContact.groupId || "";
      const offer = await webrtcService.createOffer();
      socketService.sendOffer(targetId, selectedContact.type, chatKey, offer, "audio");
      setIsAudioCallActive(true);
      // toast.success("Audio call started");
    } catch (error) {
      console.error("Error starting audio call:", error);
      toast.error("Failed to start audio call. Check microphone permissions.");
      setIsAudioCallActive(false);
      setLocalStream(null);
    }
  };

  const acceptCall = async () => {
    if (!selectedContact || !incomingCallData || !webrtcService) {
      console.log("Cannot accept call: Missing contact or call data");
      toast.error("Cannot accept call");
      return;
    }

    //SLOT VALIDATION
    // if (!isCurrentTimeInSlot(selectedContact)) {
    //   console.log('Cannot accept call: Outside scheduled slot');
    //   toast.error('Calls can only be accepted during scheduled slots');
    //   declineCall();
    //   return;
    // }

    try {
      console.log(`Accepting ${incomingCallData.callType} call from:`, incomingCallData.userId);
      await initWebRTC();
      await webrtcService.setRemoteDescription(incomingCallData.offer);
      const stream = incomingCallData.callType === "audio"
        ? await webrtcService.getLocalAudioStream()
        : await webrtcService.getLocalStream();
      setLocalStream(stream);
      const answer = await webrtcService.createAnswer();
      socketService.sendAnswer(incomingCallData.userId, selectedContact.type, incomingCallData.chatKey, answer, incomingCallData.callType);
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          console.log("Applying queued ICE candidate after accepting call:", candidate);
          await webrtcService.addIceCandidate(candidate);
        }
      }
      setIsIncomingCall(false);
      setIncomingCallData(null);
      if (incomingCallData.callType === "audio") {
        setIsAudioCallActive(true);
      } else {
        setIsVideoCallActive(true);
      }
      setIsCallTerminated(false);
      // toast.success(`${incomingCallData.callType.charAt(0).toUpperCase() + incomingCallData.callType.slice(1)} call accepted`);
    } catch (error) {
      console.error(`Error accepting ${incomingCallData?.callType} call:`, error);
      toast.error(`Failed to accept ${incomingCallData?.callType} call. Check permissions.`);
      setIsIncomingCall(false);
      setIncomingCallData(null);
    }
  };

  return (
    <div
      className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r ${getGradient()} text-white rounded-t-xl shadow-md z-[40]`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {(isMobileView || type) && (
          <Button
            isIconOnly
            variant="light"
            onPress={type ? () => navigate("/chat") : toggleSidebar}
            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
            aria-label={type ? "Go back" : "Toggle sidebar"}
          >
            {type ? <FaArrowLeft size={16} /> : <FaBars size={16} />}
          </Button>
        )}
        {selectedContact && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar
              src={selectedContact.profilePic}
              className="border-2 border-white w-8 h-8 sm:w-10 sm:h-10"
              size="sm"
              isBordered
              color={
                selectedContact.type === "user-mentor"
                  ? "primary"
                  : selectedContact.type === "group"
                  ? "success"
                  : "secondary"
              }
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold truncate max-w-[150px] sm:max-w-[200px]">
                {selectedContact.name}
              </h2>
              {getTypingIndicator() || (
                <p className="text-xs text-white/80 truncate max-w-[150px] sm:max-w-[200px]">
                  {selectedContact.type === "user-mentor"
                    ? "Mentorship"
                    : selectedContact.type === "group"
                    ? `${selectedContact.groupDetails?.members.length || 0} members`
                    : selectedContact.targetJobTitle || "Connection"}
                </p>
              )}
            </div>
          </div>
        )}
        {!selectedContact && (
          <h2 className="text-base sm:text-lg font-bold">Select a conversation</h2>
        )}
      </div>
      {selectedContact && (
        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip content={isAudioCallActive ? "End audio call" : "Voice call"} placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={isAudioCallActive ? endAudioCall : startAudioCall}
              aria-label={isAudioCallActive ? "End audio call" : "Start audio call"}
              // isDisabled={isVideoCallActive}
              // isDisabled={isVideoCallActive || !isCallEnabled}
            >
              <FaPhone size={14} />
            </Button>
          </Tooltip>
          <Tooltip content={isVideoCallActive ? "End video call" : "Video call"} placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={isVideoCallActive ? endVideoCall : startVideoCall}
              aria-label={isVideoCallActive ? "End video call" : "Start video call"}
              // isDisabled={isAudioCallActive || !isCallEnabled}
              isDisabled={isVideoCallActive}
            >
              <FaVideo size={14} />
            </Button>
          </Tooltip>
          <Suspense fallback={<div className="text-white">Loading group call...</div>}>
            <GroupCall
              selectedContact={selectedContact}
              isVideoCallActive={isVideoCallActive}
              setIsVideoCallActive={setIsVideoCallActive}
              getChatKey={getChatKey}
              currentUserId={selectedContact?.userId}
              ref={groupCallRef}
            />
          </Suspense>
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="flat"
                className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
                aria-label="More options"
              >
                <FaEllipsisV size={14} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chat options">
              <DropdownItem
                key="info"
                startContent={<FaInfoCircle />}
                onPress={toggleDetailsSidebar}
              >
                {isMobileView ? "Contact Info" : "Toggle Info Panel"}
              </DropdownItem>
              {selectedContact.type === "group" && (
                <DropdownItem key="members" startContent={<FaUserFriends />}>
                  View Members
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
      {isVideoCallActive && selectedContact?.type !== "group" && (
        <div className="fixed inset-0 bg-black z-[50] flex flex-col items-center justify-center p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 sm:h-64 object-cover bg-black"
              />
              <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                You
              </p>
            </div>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 sm:h-64 object-cover bg-black"
              />
              <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                {selectedContact?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Tooltip content={isAudioMuted ? "Unmute" : "Mute"} placement="top">
              <Button
                isIconOnly
                color={isAudioMuted ? "danger" : "primary"}
                onPress={toggleAudio}
                aria-label={isAudioMuted ? "Unmute" : "Mute"}
              >
                {isAudioMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content={isVideoOff ? "Turn video on" : "Turn video off"} placement="top">
              <Button
                isIconOnly
                color={isVideoOff ? "danger" : "primary"}
                onPress={toggleVideo}
                aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
              >
                {isVideoOff ? <FaVideoSlash size={16} /> : <FaVideo size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content={isScreenSharing ? "Stop sharing" : "Share screen"} placement="top">
              <Button
                isIconOnly
                color={isScreenSharing ? "danger" : "primary"}
                onPress={toggleScreenShare}
                aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                <FaDesktop size={16} />
              </Button>
            </Tooltip>
            <Button
              color="danger"
              onPress={endVideoCall}
              aria-label="End call"
            >
              End Call
            </Button>
          </div>
        </div>
      )}
      {isAudioCallActive && selectedContact?.type !== "group" && (
        <div className="fixed inset-0 bg-black z-[50] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="bg-gray-900 rounded-lg p-4 w-full text-center">
              <p className="text-white text-lg font-semibold">Audio Call with {selectedContact?.name}</p>
              <audio ref={localAudioRef} autoPlay muted />
              <audio ref={remoteAudioRef} autoPlay />
            </div>
            <div className="flex gap-2">
              <Tooltip content={isAudioMuted ? "Unmute" : "Mute"} placement="top">
                <Button
                  isIconOnly
                  color={isAudioMuted ? "danger" : "primary"}
                  onPress={toggleAudio}
                  aria-label={isAudioMuted ? "Unmute" : "Mute"}
                >
                  {isAudioMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                </Button>
              </Tooltip>
              <Button
                color="danger"
                onPress={endAudioCall}
                aria-label="End call"
              >
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={isIncomingCall && selectedContact?.type !== "group"} onClose={declineCall}>
        <ModalContent>
          <ModalHeader>Incoming {incomingCallDetails?.callType === "audio" ? "Audio" : "Video"} Call</ModalHeader>
          <ModalBody>
            <p>Call from {incomingCallDetails?.callerName || "Unknown"}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={declineCall}>
              Decline
            </Button>
            <Button color="primary" onPress={acceptCall}>
              Accept
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ChatHeader;