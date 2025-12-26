import React, { lazy, Suspense } from "react";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@nextui-org/react";
import {
  FaPhone,
  FaVideo,
  FaBars,
  FaEllipsisV,
  FaUserFriends,
  FaInfoCircle,
} from "react-icons/fa";
import { Contact } from "../../../../Interface/User/Icontact";
import { useChatCall } from "../../../../Hooks/User/Chat/OneToOneCall/useChatCall";
import VideoCallOverlay from "./VideoCallOverlay";
import AudioCallOverlay from "./AudioCallOverlay";
import { useGroupCall } from "../../../../Hooks/User/Chat/GroupCall/useChatGroupCall";

const GroupCall = lazy(() => import("./Groups/GroupCall"));

interface ChatHeaderProps {
  selectedContact: Contact | null;
  toggleSidebar?: () => void;
  toggleDetailsSidebar?: () => void;
  onlineUsers?: Record<string, boolean>;
  typingUsers: { [key: string]: string[] };
  currentUserId: string;
  getChatKey: (contact: Contact) => string;
  call: ReturnType<typeof useChatCall>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedContact,
  onlineUsers,
  toggleSidebar,
  toggleDetailsSidebar,
  typingUsers,
  currentUserId,
  getChatKey,
  call,
}) => {
  const {
    isAudioCallActive,
    isVideoCallActive,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    startVideoCall,
    startAudioCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = call;

  const { isGroupCallActive, startGroupCall, endGroupCall } = useGroupCall({
    currentUserId,
    selectedContact,
  });

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

  const getOtherUserId = (): string | null => {
    if (!selectedContact || selectedContact.type === "group") {
      console.log("Group chat → no online indicator");
      return null;
    }
    if (!currentUserId) {
      console.log("No currentUserId → cannot determine other user");
      return null;
    }
    const candidates = [
      selectedContact.targetId,
      selectedContact.targetId.toString(),
      selectedContact.targetId,
      selectedContact.contactId,
      selectedContact.id,
      selectedContact.userId.toString(),
      selectedContact.userId,
    ].filter(Boolean);
    const otherId = candidates.find((id) => id !== currentUserId);
    return otherId || null;
  };

  const otherUserId = getOtherUserId();
  const isOnline = otherUserId ? !!onlineUsers?.[otherUserId] : false;

  const getTypingIndicator = () => {
    if (!selectedContact) return null;
    const chatKey = getChatKey(selectedContact);
    const typingUserIds = typingUsers[chatKey] || [];
    if (typingUserIds.length === 0) return null;

    const typingUsersNames = typingUserIds
      .map((userId) => {
        let memberName: string | undefined;
        if (
          selectedContact.type === "group" &&
          selectedContact.groupDetails?.members
        ) {
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
            {/* Avatar with online dot */}
            <div className="relative">
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
              {/* Green online dot */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
              )}
            </div>

            {/* Name + Status */}
            <div>
              <h2 className="text-base sm:text-lg font-bold truncate max-w-[150px] sm:max-w-[200px]">
                {selectedContact.name}
              </h2>

              {getTypingIndicator() ||
                (selectedContact.type === "group" ? (
                  <p className="text-xs text-white/80">
                    {selectedContact.groupDetails?.members.length || 0} members
                  </p>
                ) : isOnline ? (
                  <p className="text-xs text-green-200 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </p>
                ) : (
                  <p className="text-xs text-white/80">
                    {selectedContact.targetJobTitle || "Offline"}
                  </p>
                ))}
            </div>
          </div>
        )}
        {!selectedContact && (
          <h2 className="text-base sm:text-lg font-bold">
            Select a conversation
          </h2>
        )}
      </div>

      {selectedContact && (
        <div className="flex items-center gap-1 sm:gap-2">
          {/* AUDIO CALL BUTTON */}
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

          {/* VIDEO CALL BUTTON */}
          <Button
            isIconOnly
            variant="flat"
            className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
            onPress={() => {
              if (selectedContact?.type === "group") {
                if (isGroupCallActive) {
                  endGroupCall();
                } else {
                  startGroupCall();
                }
              } else {
                if (isVideoCallActive) {
                  endCall();
                } else {
                  startVideoCall();
                }
              }
            }}
            aria-label={
              selectedContact?.type === "group"
                ? isGroupCallActive
                  ? "End group video call"
                  : "Start group video call"
                : isVideoCallActive
                ? "End video call"
                : "Video call"
            }
            isDisabled={isAudioCallActive}
          >
            <FaVideo size={14} />
          </Button>

          {/* GROUP CALL COMPONENT */}
          {selectedContact.type === "group" && (
            <Suspense fallback={<Spinner size="sm" color="primary" />}>
              <GroupCall
                groupId={selectedContact.groupId || ""}
                userId={selectedContact.userId || ""}
                isActive={isGroupCallActive}
                onEnd={endGroupCall}
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
        <VideoCallOverlay
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          endCall={endCall}
          remoteName={selectedContact.name}
          isCallInProgress={
            isAudioCallActive ||
            isVideoCallActive ||
            !!call.incomingCallData
          }
          className={
            isAudioCallActive || isVideoCallActive || !!call.incomingCallData
              ? "block"
              : "hidden"
          }
                />
      )}

      {/* AUDIO CALL OVERLAY */}
      {isAudioCallActive && selectedContact?.type !== "group" && (
        <AudioCallOverlay
          isAudioMuted={isAudioMuted}
          toggleAudio={toggleAudio}
          endCall={endCall}
          remoteName={selectedContact.name}
        />
      )}
    </div>
  );
};

export default ChatHeader;
