import React, { useState, useRef, useEffect } from "react";
import { Button, Tooltip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { FaArrowLeft, FaPhone, FaVideo, FaBars, FaEllipsisV, FaUserFriends, FaInfoCircle } from "react-icons/fa";
import { Contact } from "../../../../types";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";

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
}

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
}) => {
  const webrtcService = useRef<WebRTCService | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{ userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit } | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);

  const initializeWebRTC = async () => {
    if (!webrtcService.current) {
      console.log("Initializing WebRTCService");
      webrtcService.current = new WebRTCService();
      await webrtcService.current.initPeerConnection();
      console.log("Peer connection initialized");
    }
  };

  // Set up WebRTC and persistent listeners
  useEffect(() => {
    initializeWebRTC().then(() => {
      const peerConnection = webrtcService.current!.getPeerConnection();
      if (peerConnection) {
        peerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0];
          console.log("Received remote stream, track details:");
          remoteStream.getTracks().forEach((track, index) => {
            console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
          });
          setRemoteStream(remoteStream);
        };
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && selectedContact) {
            const chatKey = getChatKey(selectedContact);
            const targetId = selectedContact.targetId || selectedContact.groupId || "";
            console.log("Sending ICE candidate:", event.candidate);
            socketService.sendIceCandidate(targetId, selectedContact.type, chatKey, event.candidate);
          }
        };
      }
    }).catch((err) => {
      console.error("Error initializing WebRTC:", err);
    });

    const handleOffer = async (data: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit }) => {
      if (selectedContact && data.chatKey === getChatKey(selectedContact) && !isVideoCallActive) {
        console.log("Incoming call offer:", data);
        await initializeWebRTC();
        setIncomingCallData(data);
        setIsIncomingCall(true);
      }
    };

    const handleAnswer = (data: { userId: string; targetId: string; type: string; chatKey: string; answer: RTCSessionDescriptionInit }) => {
      if (selectedContact && data.chatKey === getChatKey(selectedContact) && webrtcService.current) {
        console.log("Received answer:", data);
        webrtcService.current.setRemoteDescription(data.answer).then(() => {
          while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) {
              console.log("Applying queued ICE candidate after answer:", candidate);
              webrtcService.current!.addIceCandidate(candidate).catch((error) => {
                console.error("Error applying queued ICE candidate:", error);
              });
            }
          }
        }).catch((error) => {
          console.error("Error setting remote description for answer:", error);
        });
      }
    };

    const handleIceCandidate = (data: { userId: string; targetId: string; type: string; chatKey: string; candidate: RTCIceCandidateInit }) => {
      if (selectedContact && data.chatKey === getChatKey(selectedContact)) {
        console.log("Received ICE candidate:", data);
        if (!webrtcService.current || !webrtcService.current.getPeerConnection()) {
          console.log("Queuing ICE candidate: peer connection not initialized");
          iceCandidateQueue.current.push(new RTCIceCandidate(data.candidate));
          return;
        }
        if (!webrtcService.current.hasRemoteDescription()) {
          console.log("Queuing ICE candidate: remote description not set");
          iceCandidateQueue.current.push(new RTCIceCandidate(data.candidate));
          return;
        }
        webrtcService.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch((error) => {
          console.error("Error adding ICE candidate:", error);
        });
      }
    };

    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);

    return () => {
      console.log("Cleaning up socket listeners");
      socketService.socket?.off("offer", handleOffer);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("ice-candidate", handleIceCandidate);
    };
  }, [selectedContact, getChatKey, isVideoCallActive]);

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

    console.log("Selected contact in chat header:", selectedContact);

    const typingUsersNames = typingUserIds
      .map((userId) => {
        let memberName: string | undefined;

        if (selectedContact.type === "group" && selectedContact.groupDetails?.members) {
          const member = selectedContact.groupDetails.members.find(
            (m) => m.userId === userId
          );
          console.log("Group member lookup:", { userId, member });
          memberName = member?.name;
        } else if (selectedContact.type === "user-mentor" && selectedContact.collaborationDetails) {
          if (selectedContact.userId === userId) {
            memberName = selectedContact.name;
          } else if (selectedContact.contactId === userId) {
            memberName = selectedContact.collaborationDetails.mentorName || selectedContact.name;
          }
          console.log("Mentor lookup:", { userId, memberName });
        } else if (selectedContact.type === "user-user") {
          if (selectedContact.userId === userId) {
            memberName = selectedContact.name;
          } else if (selectedContact.contactId === userId) {
            memberName = selectedContact.connectionDetails?.requesterName || "Unknown";
          }
          console.log("User-user lookup:", { userId, memberName });
        }

        return memberName || "Unknown User";
      })
      .filter(Boolean)
      .join(", ");

    if (!typingUsersNames) return null;

    return (
      <p className="text-xs text-green-200 animate-pulse">
        {typingUsersNames} {typingUsersNames.includes(",") ? "are" : "is"} typing...
      </p>
    );
  };

  const startVideoCall = async () => {
    if (!selectedContact) {
      console.log("No contact selected for video call");
      return;
    }

    try {
      console.log("Starting video call for contact:", selectedContact.id);
      await initializeWebRTC();
      const stream = await webrtcService.current!.getLocalStream();
      setLocalStream(stream);

      if (toggleDetailsSidebar) {
        console.log("Closing details sidebar for video call");
        toggleDetailsSidebar();
      }

      const chatKey = getChatKey(selectedContact);
      const targetId = selectedContact.targetId || selectedContact.groupId || "";
      const offer = await webrtcService.current!.createOffer();
      socketService.sendOffer(targetId, selectedContact.type, chatKey, offer);

      setIsVideoCallActive(true);
      console.log("Video call started successfully");
    } catch (error) {
      console.error("Error starting video call:", error);
      setIsVideoCallActive(false);
      setLocalStream(null);
    }
  };

  const acceptCall = async () => {
    if (!selectedContact || !incomingCallData || !webrtcService.current) {
      console.log("Cannot accept call: Missing contact or call data");
      return;
    }

    try {
      console.log("Accepting call from:", incomingCallData.userId);
      await webrtcService.current.setRemoteDescription(incomingCallData.offer);
      const stream = await webrtcService.current.getLocalStream();
      setLocalStream(stream);
      const answer = await webrtcService.current.createAnswer();
      socketService.sendAnswer(incomingCallData.userId, selectedContact.type, incomingCallData.chatKey, answer);

      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          console.log("Applying queued ICE candidate after accepting call:", candidate);
          await webrtcService.current!.addIceCandidate(candidate);
        }
      }

      setIsIncomingCall(false);
      setIncomingCallData(null);
      setIsVideoCallActive(true);
      console.log("Call accepted successfully");
    } catch (error) {
      console.error("Error accepting call:", error);
      setIsIncomingCall(false);
      setIncomingCallData(null);
    }
  };

  const declineCall = () => {
    console.log("Declining call from:", incomingCallData?.userId);
    setIsIncomingCall(false);
    setIncomingCallData(null);
  };

  const endVideoCall = () => {
    console.log("Ending video call");
    if (webrtcService.current) {
      webrtcService.current.stop();
      webrtcService.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsVideoCallActive(false);
    console.log("Video call ended");
  };

  // Assign streams to video elements
  useEffect(() => {
    if (isVideoCallActive && localStream && localVideoRef.current) {
      console.log("useEffect: Assigning local stream, tracks:", localStream.getTracks());
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().then(() => {
        console.log("Local video playing successfully");
      }).catch((err) => {
        console.error("Error playing local video:", err);
      });
    }
    if (isVideoCallActive && remoteStream && remoteVideoRef.current) {
      console.log("useEffect: Assigning remote stream, tracks:", remoteStream.getTracks());
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().then(() => {
        console.log("Remote video playing successfully");
      }).catch((err) => {
        console.error("Error playing remote video:", err);
      });
    }
  }, [isVideoCallActive, localStream, remoteStream]);

  // Cleanup WebRTC on unmount
  useEffect(() => {
    return () => {
      if (webrtcService.current) {
        console.log("Cleaning up WebRTC service on unmount");
        webrtcService.current.stop();
        webrtcService.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r ${getGradient()} text-white rounded-t-xl shadow-md z-[150]`}
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
          <Tooltip content="Voice call" placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={() => alert("Audio call feature coming soon!")}
              aria-label="Voice call"
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
            >
              <FaVideo size={14} />
            </Button>
          </Tooltip>

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

      {isVideoCallActive && (
        <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 sm:h-64 object-cover bg-black"
              />
              <p className="text-white text-center mt-2">Local Video</p>
            </div>
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 sm:h-64 object-cover bg-black"
              />
              <p className="text-white text-center mt-2">Remote Video</p>
            </div>
          </div>
          <Button
            color="danger"
            onPress={endVideoCall}
            className="mt-4"
            aria-label="End call"
          >
            End Call
          </Button>
        </div>
      )}

      <Modal isOpen={isIncomingCall} onClose={declineCall}>
        <ModalContent>
          <ModalHeader>Incoming Video Call</ModalHeader>
          <ModalBody>
            <p>Call from {selectedContact?.name || "Unknown"}</p>
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