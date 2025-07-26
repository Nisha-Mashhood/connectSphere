import React, { useEffect, useRef, useState, useCallback, useMemo, forwardRef } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tooltip } from "@nextui-org/react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop } from "react-icons/fa";
import { Contact } from "../../../../types";
import { GroupCallService } from "../../../../Service/GroupcallService"; 
import { socketService } from "../../../../Service/SocketService"; 
import { GroupWebRTCService } from "../../../../Service/GroupWebRTCService"; 
import toast from "react-hot-toast";

interface GroupCallProps {
  selectedContact: Contact | null;
  isVideoCallActive: boolean;
  setIsVideoCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  getChatKey: (contact: Contact) => string;
  currentUserId?: string;
}

interface GroupCallHandle {
  startGroupCall: (type: "audio" | "video") => void;
}

const GroupCall = forwardRef<GroupCallHandle, GroupCallProps>(
  ({ selectedContact, setIsVideoCallActive, currentUserId }, ref) => {
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callType, setCallType] = useState<"audio" | "video" | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [connectionStates, setConnectionStates] = useState<Map<string, string>>(new Map());
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState<{
      groupId: string;
      senderId: string;
      recipientId: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      callId: string;
      callerName?: string;
    } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
    const groupCallServiceRef = useRef<GroupCallService>();
    const videoInitialized = useRef<Map<string, boolean>>(new Map());

    React.useImperativeHandle(ref, () => ({
      startGroupCall: (type: "audio" | "video") => {
        startGroupCall(type);
      },
    }));

    const toggleAudio = useCallback(() => {
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsAudioMuted(!audioTrack.enabled);
          console.log(`Audio track toggled: ${audioTrack.enabled ? "unmuted" : "muted"}`);
          toast.success(audioTrack.enabled ? "Microphone unmuted" : "Microphone muted");
        } else {
          console.warn("No audio track available to toggle");
          toast.error("No audio track available");
        }
      }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
      if (localStream && callType === "video") {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoOff(!videoTrack.enabled);
          console.log(`Video track toggled: ${videoTrack.enabled ? "on" : "off"}`);
          toast.success(videoTrack.enabled ? "Video turned on" : "Video turned off");
        } else {
          console.warn("No video track available to toggle");
          toast.error("No video track available");
        }
      }
    }, [localStream, callType]);

    const toggleScreenShare = useCallback(async () => {
      if (!groupCallServiceRef.current || !localStream) {
        console.warn("Cannot toggle screen share: GroupCallService or local stream missing");
        toast.error("Cannot toggle screen share");
        return;
      }

      if (isScreenSharing) {
        const videoTrack = localStream.getVideoTracks()[0];
        const groupMembers = selectedContact?.groupDetails?.members
          ?.map((member) => member.userId)
          .filter((id) => id !== currentUserId) || [];
        for (const userId of groupMembers) {
          const peer = groupCallServiceRef.current['webRTCService'].getPeerConnection(userId);
          if (peer && videoTrack) {
            const sender = peer.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              await sender.replaceTrack(videoTrack);
              console.log(`Screen sharing stopped for ${userId}, reverted to camera`);
            }
          }
        }
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getVideoTracks()[0];
          const groupMembers = selectedContact?.groupDetails?.members
            ?.map((member) => member.userId)
            .filter((id) => id !== currentUserId) || [];
          for (const userId of groupMembers) {
            const peer = groupCallServiceRef.current['webRTCService'].getPeerConnection(userId);
            if (peer) {
              const sender = peer.getSenders().find((s) => s.track?.kind === "video");
              if (sender) {
                await sender.replaceTrack(screenTrack);
                console.log(`Screen sharing started for ${userId}`);
              }
            }
          }
          screenTrack.onended = () => {
            const videoTrack = localStream.getVideoTracks()[0];
            for (const userId of groupMembers) {
              const peer = groupCallServiceRef.current['webRTCService'].getPeerConnection(userId);
              if (peer && videoTrack) {
                const sender = peer.getSenders().find((s) => s.track?.kind === "video");
                if (sender) {
                  sender.replaceTrack(videoTrack);
                  console.log(`Screen sharing ended by user for ${userId}, reverted to camera`);
                }
              }
            }
            setIsScreenSharing(false);
            toast.success("Screen sharing ended");
          };
          setIsScreenSharing(true);
          toast.success("Screen sharing started");
        } catch (error) {
          console.error("Error starting screen share:", error);
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            toast.error("Screen sharing permission denied. Please allow screen sharing in your browser.");
          } else {
            toast.error("Failed to start screen sharing");
          }
        }
      }
    }, [isScreenSharing, localStream, selectedContact, currentUserId]);

    const endGroupCall = useCallback(async () => {
      console.log("Ending group call");
      const groupMembers = selectedContact?.groupDetails?.members
        ?.map((member) => member.userId)
        .filter((id) => id !== currentUserId) || [];
      const callId = groupCallServiceRef.current?.['webRTCService']['callId'] || `call-${Date.now()}`;
      await groupCallServiceRef.current?.endGroupCall(
        selectedContact?.groupId || "",
        callType || "video",
        callId,
        groupMembers
      );
      setIsCallModalOpen(false);
      setIsVideoCallActive(false);
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setCallType(null);
      setLocalStream((prev) => {
        prev?.getTracks().forEach((track) => track.stop());
        return null;
      });
      setRemoteStreams(new Map());
      setConnectionStates(new Map());
      setIsAudioMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
      videoInitialized.current.clear();
      remoteVideoRefs.current.forEach((video) => {
        video.srcObject = null;
      });
      remoteVideoRefs.current.clear();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      toast.success("Group call ended");
    }, [selectedContact, currentUserId, callType, setIsVideoCallActive]);

    const startGroupCall = useCallback(
      async (type: "audio" | "video") => {
        if (!selectedContact || selectedContact.type !== "group" || !currentUserId) {
          console.log("Cannot start group call: Invalid contact or user ID", {
            selectedContact,
            currentUserId,
          });
          toast.error("Cannot start group call");
          return;
        }

        try {
          const groupMembers = selectedContact.groupDetails?.members
            ?.map((member) => member.userId)
            .filter((id) => id !== currentUserId) || [];
          const callId = `call-${Date.now()}`;
          groupCallServiceRef.current = new GroupCallService(
            currentUserId,
            socketService,
            new GroupWebRTCService(
              (userId, candidate, callType, callId) => {
                socketService.sendGroupIceCandidate(
                  selectedContact.groupId || "",
                  currentUserId,
                  userId,
                  candidate,
                  callType,
                  callId
                );
                console.log(`Sent ICE candidate to ${userId} for call ${callId}`);
              },
              (userId, stream) => {
                console.log(`Updating remote stream for ${userId}`);
                setRemoteStreams((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(userId, stream);
                  return newMap;
                });
              },
              (userId, state) => {
                console.log(`Connection state updated for ${userId}: ${state}`);
                setConnectionStates((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(userId, state);
                  return newMap;
                });
                if (state === "disconnected" || state === "failed" || state === "closed") {
                  setRemoteStreams((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(userId);
                    return newMap;
                  });
                  videoInitialized.current.delete(userId);
                  remoteVideoRefs.current.delete(userId);
                }
              },
              callId
            ),
            
          );

          console.log(`Starting group ${type} call for members: ${groupMembers.join(", ")}`);
          const stream = await groupCallServiceRef.current.startGroupCall(
            selectedContact.groupId || "",
            [...groupMembers, currentUserId],
            type,
            callId
          );
          setLocalStream(stream);
          setCallType(type);
          setIsCallModalOpen(true);
          setIsVideoCallActive(type === "video");
        } catch (error) {
          console.error(`Error starting group ${type} call:`, error);
          toast.error(`Failed to start group ${type} call. Check permissions.`);
          endGroupCall();
        }
      },
      [selectedContact, currentUserId, setIsVideoCallActive]
    );

    useEffect(() => {
      if (!selectedContact || selectedContact.type !== "group" || !currentUserId) {
        console.log("Skipping useEffect: invalid contact or user ID", {
          selectedContact,
          currentUserId,
          hasGroupId: !!selectedContact?.groupId,
          isGroupType: selectedContact?.type === "group",
        });
        return;
      }

      socketService.joinUserRoom(currentUserId);
      console.log(`Joined user room: user_${currentUserId}`);

      const handleIncomingCall = (data: {
        groupId: string;
        senderId: string;
        recipientId: string;
        offer: RTCSessionDescriptionInit;
        callType: "audio" | "video";
        callId: string;
      }) => {
        if (data.groupId === selectedContact.groupId && data.recipientId === currentUserId) {
          const callerName = selectedContact.groupDetails?.members?.find(
            (member) => member.userId === data.senderId
          )?.name || "Unknown";
          console.log(`Incoming ${data.callType} call from ${callerName} (${data.senderId}) for call ${data.callId}`);
          setIncomingCallData({ ...data, callerName });
          setIsIncomingCall(true);
          setCallType(data.callType);
          setIsVideoCallActive(data.callType === "video");
          toast(`Incoming ${data.callType} call from ${callerName}`, { duration: 30000 });
        } else {
          console.log(`Ignoring offer: groupId or recipientId mismatch`, {
            receivedGroupId: data.groupId,
            selectedGroupId: selectedContact.groupId,
            receivedRecipientId: data.recipientId,
            currentUserId,
          });
        }
      };

      groupCallServiceRef.current = new GroupCallService(
        currentUserId,
        socketService,
        new GroupWebRTCService(
          (userId, candidate, callType, callId) => {
            socketService.sendGroupIceCandidate(
              selectedContact.groupId || "",
              currentUserId,
              userId,
              candidate,
              callType,
              callId
            );
            console.log(`Sent ICE candidate to ${userId} for call ${callId}`);
          },
          (userId, stream) => {
            console.log(`Updating remote stream for ${userId}`);
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.set(userId, stream);
              return newMap;
            });
          },
          (userId, state) => {
            console.log(`Connection state updated for ${userId}: ${state}`);
            setConnectionStates((prev) => {
              const newMap = new Map(prev);
              newMap.set(userId, state);
              return newMap;
            });
            if (state === "disconnected" || state === "failed" || state === "closed") {
              setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
              });
              videoInitialized.current.delete(userId);
              remoteVideoRefs.current.delete(userId);
            }
          },
          "" // callId set later for incoming calls
        )
      );

      socketService.onGroupOffer(handleIncomingCall);

      return () => {
        socketService.offGroupOffer(handleIncomingCall);
        socketService.leaveUserRoom(currentUserId);
        groupCallServiceRef.current?.dispose();
        console.log(`Cleanup: Left user room user_${currentUserId}`);
        groupCallServiceRef.current = undefined;
      };
    }, [selectedContact, currentUserId, setIsVideoCallActive]);

    const declineGroupCall = useCallback(() => {
      console.log("Declining group call");
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setIsVideoCallActive(false);
      setIsCallModalOpen(false);
      if (incomingCallData) {
        socketService.emitGroupCallEnded(
          incomingCallData.groupId,
          currentUserId || "",
          incomingCallData.senderId,
          incomingCallData.callType,
          incomingCallData.callId
        );
        toast.error(`${incomingCallData.callType.charAt(0).toUpperCase() + incomingCallData.callType.slice(1)} call declined`);
      }
    }, [currentUserId, incomingCallData, setIsVideoCallActive]);

    const acceptGroupCall = useCallback(async () => {
      if (!selectedContact || !incomingCallData || !currentUserId) {
        console.log("Cannot accept group call: Missing contact or call data", {
          selectedContact,
          incomingCallData,
          currentUserId,
        });
        toast.error("Cannot accept group call");
        return;
      }

      try {
        const groupMembers = selectedContact.groupDetails?.members
          ?.map((member) => member.userId)
          .filter((id) => id !== currentUserId) || [];
        console.log(`Accepting ${incomingCallData.callType} call from ${incomingCallData.senderId}`);
        const stream = await groupCallServiceRef.current?.startGroupCall(
          selectedContact.groupId || "",
          [...groupMembers, currentUserId],
          incomingCallData.callType,
          incomingCallData.callId
        );
        if (!stream) {
          throw new Error("Failed to get local stream");
        }
        setLocalStream(stream);
        setCallType(incomingCallData.callType);
        setIsCallModalOpen(true);
        setIsVideoCallActive(incomingCallData.callType === "video");
        setIsIncomingCall(false);
        setIncomingCallData(null);

        // Process incoming offer
        await groupCallServiceRef.current['webRTCService'].setRemoteOffer(
          incomingCallData.senderId,
          incomingCallData.offer
        );
        const answer = await groupCallServiceRef.current['webRTCService'].createAnswer(incomingCallData.senderId);
        socketService.sendGroupAnswer(
          incomingCallData.groupId,
          currentUserId,
          incomingCallData.senderId,
          answer,
          incomingCallData.callType,
          incomingCallData.callId
        );
      } catch (error) {
        console.error(`Error accepting ${incomingCallData?.callType} call:`, error);
        toast.error(`Failed to accept ${incomingCallData?.callType} call. Check permissions.`);
        declineGroupCall();
      }
    }, [selectedContact, currentUserId, incomingCallData, setIsVideoCallActive]);

    useEffect(() => {
      let timeout: number;
      if (isIncomingCall && incomingCallData) {
        timeout = setTimeout(() => {
          console.log(`Auto-declining ${incomingCallData.callType} group call after 30 seconds`);
          declineGroupCall();
        }, 30000);
      }
      return () => clearTimeout(timeout);
    }, [isIncomingCall, incomingCallData, declineGroupCall]);

    useEffect(() => {
      if (localStream && localVideoRef.current && !videoInitialized.current.get("local") && callType === "video") {
        console.log("Setting srcObject for local video");
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play()
          .then(() => console.log("Local video playing successfully"))
          .catch((error) => {
            console.error("Error playing local video:", error);
            toast.error("Failed to play local video");
          });
        videoInitialized.current.set("local", true);
      }
    }, [localStream, callType]);

    useEffect(() => {
      remoteStreams.forEach((stream, userId) => {
        const videoElement = remoteVideoRefs.current.get(userId);
    if (videoElement && !videoInitialized.current.get(userId)) {
      console.log(`Setting srcObject for remote video ${userId}`);
      videoElement.srcObject = stream;
      stream.getVideoTracks().forEach((track) => {
        console.log(`Track ${track.id} for ${userId}: enabled=${track.enabled}, muted=${track.muted}`);
        track.enabled = true;
      });
      videoElement.play()
        .then(() => console.log(`Remote video for ${userId} playing successfully`))
        .catch((error) => {
          console.error(`Error playing remote video for ${userId}:`, error);
          toast.error(`Failed to play remote video for ${userId}`);
        });
      videoInitialized.current.set(userId, true);
    }
  });
    }, [remoteStreams]);

    const getGridLayout = (participantCount: number) => {
      if (participantCount <= 1) return "grid-cols-1";
      if (participantCount === 2) return "grid-cols-2";
      if (participantCount === 3) return "grid-cols-2 sm:grid-cols-3";
      return "grid-cols-2 sm:grid-cols-4";
    };

    const videoGrid = useMemo(() => {
      const participantCount = remoteStreams.size + (localStream && callType === "video" ? 1 : 0);
      const gridClass = getGridLayout(participantCount);
      const videos = [];

      if (callType === "video" && localStream) {
        const localUserName = selectedContact?.groupDetails?.members?.find(
          (member) => member.userId === currentUserId
        )?.name || "You";
        console.log(`Local stream for ${currentUserId}, name: ${localUserName}`);
        videos.push(
          <div key="local" className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 sm:h-64 object-cover bg-black"
            />
            <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
              {localUserName}
            </p>
          </div>
        );
      }

      remoteStreams.forEach((stream, userId) => {
        const userName = selectedContact?.groupDetails?.members?.find(
          (member) => member.userId === userId
        )?.name || `Unknown (${userId})`;
        console.log(`Remote stream for ${userId}, name: ${userName}`);
        videos.push(
          <div key={userId} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={(el) => {
                if (el && !remoteVideoRefs.current.has(userId)) {
                  remoteVideoRefs.current.set(userId, el);
                  console.log(`Assigned video ref for ${userId}`);
                }
              }}
              autoPlay
              playsInline
              className="w-full h-48 sm:h-64 object-cover bg-black"
            />
            <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
              {userName} ({connectionStates.get(userId) || "Unknown"})
            </p>
          </div>
        );
      });

      return <div className={`grid ${gridClass} gap-4`}>{videos}</div>;
    }, [remoteStreams, localStream, callType, selectedContact, currentUserId, connectionStates]);

    return (
      <>
        <Modal isOpen={isIncomingCall} onClose={declineGroupCall}>
          <ModalContent>
            <ModalHeader>
              Incoming {incomingCallData?.callType === "audio" ? "Audio" : "Video"} Call
            </ModalHeader>
            <ModalBody>
              <p>
                Call from {incomingCallData?.callerName || "Unknown"} in{" "}
                {selectedContact?.groupDetails?.groupName || "Group"}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={declineGroupCall}>
                Decline
              </Button>
              <Button color="primary" onPress={acceptGroupCall}>
                Accept
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isCallModalOpen && !isIncomingCall}
          onClose={endGroupCall}
          size="full"
          className="bg-white dark:bg-gray-900"
        >
          <ModalContent>
            <ModalHeader>
              {callType === "video" ? "Group Video Call" : "Group Audio Call"} -{" "}
              {selectedContact?.groupDetails?.groupName}
            </ModalHeader>
            <ModalBody>
              {callType === "video" ? (
                videoGrid
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 w-full text-center">
                  <p className="text-white text-lg font-semibold">
                    Audio call in progress with {selectedContact?.groupDetails?.groupName}
                  </p>
                  {Array.from(connectionStates.entries()).map(([userId, state]) => {
                    const userName = selectedContact?.groupDetails?.members?.find(
                      (member) => member.userId === userId
                    )?.name || userId;
                    return (
                      <p key={userId} className="text-white">
                        {userName}: {state}
                      </p>
                    );
                  })}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
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
              {callType === "video" && (
                <>
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
                </>
              )}
              <Button color="danger" onPress={endGroupCall}>
                End Call
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

export default GroupCall;