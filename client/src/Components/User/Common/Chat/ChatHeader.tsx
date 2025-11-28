import React, { useRef, lazy, Suspense } from "react";
import {
  Button,
  Tooltip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import {
  FaPhone,
  FaVideo,
  FaBars,
  FaEllipsisV,
  FaUserFriends,
  FaInfoCircle,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaDesktop,
} from "react-icons/fa";
import { Contact } from "../../../../Interface/User/Icontact";
import { useChatCall } from "../../../../Hooks/User/Chat/OneToOneCall/useChatCall";

const GroupCall = lazy(() => import("./Groups/GroupCall"));

interface ChatHeaderProps {
  selectedContact: Contact | null;
  toggleSidebar?: () => void;
  toggleDetailsSidebar?: () => void;
  typingUsers: { [key: string]: string[] };
  getChatKey: (contact: Contact) => string;
  call: ReturnType<typeof useChatCall>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedContact,
  toggleSidebar,
  toggleDetailsSidebar,
  typingUsers,
  getChatKey,
  call,
}) => {
  const {
    isAudioCallActive,
    isVideoCallActive,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isIncomingCall,
    incomingCallData,
    localVideoRef,
    remoteVideoRef,
    localAudioRef,
    remoteAudioRef,
    startVideoCall,
    startAudioCall,
    endCall,
    acceptCall,
    declineCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = call;

  const groupCallRef = useRef<{ startGroupCall: (type: "audio" | "video") => void } | null>(
    null
  );

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
          const member = selectedContact.groupDetails.members.find(
            (m) => m.userId === userId
          );
          memberName = member?.name;
        } else if (
          selectedContact.type === "user-mentor" &&
          selectedContact.collaborationDetails
        ) {
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

  return (
    <div
      className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r ${getGradient()} text-white rounded-t-xl shadow-md z-[40]`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          isIconOnly
          variant="light"
          onPress={toggleSidebar}
          className="md:hidden text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
        >
          <FaBars size={16} />
        </Button>
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
          {/* AUDIO CALL BUTTON */}
          <Tooltip
            content={
              selectedContact.type === "group"
                ? isAudioCallActive
                  ? "End group audio call"
                  : "Group audio call"
                : isAudioCallActive
                ? "End audio call"
                : "Audio call"
            }
            placement="bottom"
          >
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={isAudioCallActive ? () => endCall() : startAudioCall}
              aria-label={
                selectedContact.type === "group"
                  ? isAudioCallActive
                    ? "End group audio call"
                    : "Group audio call"
                  : isAudioCallActive
                  ? "End audio call"
                  : "Audio call"
              }
              isDisabled={isVideoCallActive}
            >
              <FaPhone size={14} />
            </Button>
          </Tooltip>

          {/* VIDEO CALL BUTTON */}
          <Tooltip
            content={
              selectedContact.type === "group"
                ? isVideoCallActive
                  ? "End group video call"
                  : "Group video call"
                : isVideoCallActive
                ? "End video call"
                : "Video call"
            }
            placement="bottom"
          >
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={isVideoCallActive ? () => endCall() : startVideoCall}
              aria-label={
                selectedContact.type === "group"
                  ? isVideoCallActive
                    ? "End group video call"
                    : "Group video call"
                  : isVideoCallActive
                  ? "End video call"
                  : "Video call"
              }
              isDisabled={isAudioCallActive}
            >
              <FaVideo size={14} />
            </Button>
          </Tooltip>

          {/* GROUP CALL COMPONENT */}
          {selectedContact.type === "group" && (
            <Suspense fallback={<Spinner size="sm" color="primary" />}>
              <GroupCall
                groupId={selectedContact.groupId || ""}
                userId={selectedContact.userId || ""}
                callType={isVideoCallActive ? "video" : "audio"}
                ref={groupCallRef}
              />
            </Suspense>
          )}

          {/* MORE OPTIONS */}
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
                className="lg:hidden"
              >
                Toggle Info Panel
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

      {/* VIDEO CALL OVERLAY */}
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
            <Tooltip
              content={isVideoOff ? "Turn video on" : "Turn video off"}
              placement="top"
            >
              <Button
                isIconOnly
                color={isVideoOff ? "danger" : "primary"}
                onPress={toggleVideo}
                aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
              >
                {isVideoOff ? <FaVideoSlash size={16} /> : <FaVideo size={16} />}
              </Button>
            </Tooltip>
            <Tooltip
              content={isScreenSharing ? "Stop sharing" : "Share screen"}
              placement="top"
            >
              <Button
                isIconOnly
                color={isScreenSharing ? "danger" : "primary"}
                onPress={toggleScreenShare}
                aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                <FaDesktop size={16} />
              </Button>
            </Tooltip>
            <Button color="danger"  onPress={() => endCall()} aria-label="End call">
              End Call
            </Button>
          </div>
        </div>
      )}

      {/* AUDIO CALL OVERLAY */}
      {isAudioCallActive && selectedContact?.type !== "group" && (
        <div className="fixed inset-0 bg-black z-[50] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="bg-gray-900 rounded-lg p-4 w-full text-center">
              <p className="text-white text-lg font-semibold">
                Audio Call with {selectedContact?.name}
              </p>
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
              <Button color="danger" onPress={() => endCall()} aria-label="End call">
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING CALL MODAL */}
      <Modal isOpen={isIncomingCall && selectedContact?.type !== "group"} onClose={declineCall}>
        <ModalContent>
          <ModalHeader>
            Incoming {incomingCallData?.callType === "audio" ? "Audio" : "Video"} Call
          </ModalHeader>
          <ModalBody>
            <p>Call from {incomingCallData?.senderName || "Unknown"}</p>
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
