import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@nextui-org/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
} from "react-icons/fa";
import { Contact, GroupIceCandidateData } from "../../../../types";
import { GroupWebRTCService } from "../../../../Service/GroupWebRTCService";
import { socketService } from "../../../../Service/SocketService";
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

// const isCurrentTimeInSlot = (
//   selectedContact: Contact | null,
//   currentTime: Date = new Date()
// ): boolean => {
//   //SLOT VALIDATION
//   if (!selectedContact || selectedContact.type !== 'group') {
//     return true;
//   }

//   const slots = selectedContact.groupDetails?.availableSlots;

//   if (!slots || slots.length === 0) {
//     return true;
//   }

//   const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
//   const currentHours = currentTime.getHours();
//   const currentMinutes = currentTime.getMinutes();
//   const currentTimeInMinutes = currentHours * 60 + currentMinutes;

//   const matchingSlot = slots.find((slot) => slot.day === currentDay);

//   if (!matchingSlot) {
//     return false;
//   }

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

const GroupCall = forwardRef<GroupCallHandle, GroupCallProps>(
  ({ selectedContact, setIsVideoCallActive, currentUserId }, ref) => {
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callId, setCallId] = useState<string | null>(null);
    const [callType, setCallType] = useState<"audio" | "video" | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<
      Map<string, MediaStream>
    >(new Map());
    const [connectionStates, setConnectionStates] = useState<
      Map<string, string>
    >(new Map());
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
    const isInitialized = useRef(false);
    const iceCandidateListener =
      useRef<(data: GroupIceCandidateData) => void>();
    const groupOfferListener =
      useRef<
        (data: {
          groupId: string;
          senderId: string;
          recipientId: string;
          offer: RTCSessionDescriptionInit;
          callType: "audio" | "video";
          callId: string;
        }) => void
      >();
    const groupAnswerListener =
      useRef<
        (data: {
          groupId: string;
          senderId: string;
          recipientId: string;
          answer: RTCSessionDescriptionInit;
          callType: "audio" | "video";
          callId: string;
        }) => void
      >();
    const groupCallEndedListener =
      useRef<
        (data: {
          groupId: string;
          senderId: string;
          recipientId: string;
          callType: "audio" | "video";
          callId: string;
        }) => void
      >();
    const pendingIceCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(
      new Map()
    );
    const groupWebRTCServiceRef = useRef<GroupWebRTCService>();
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
          console.log(
            "Audio track toggled:",
            audioTrack.enabled ? "unmuted" : "muted"
          );
          // toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
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
          console.log(
            "Video track toggled:",
            videoTrack.enabled ? "on" : "off"
          );
          // toast.success(videoTrack.enabled ? 'Video turned on' : 'Video turned off');
        } else {
          console.warn("No video track available to toggle");
          toast.error("No video track available");
        }
      }
    }, [localStream, callType]);

    const toggleScreenShare = useCallback(async () => {
      if (!groupWebRTCServiceRef.current || !localStream) {
        console.warn(
          "Cannot toggle screen share: WebRTC service or local stream missing"
        );
        toast.error("Cannot toggle screen share");
        return;
      }

      if (isScreenSharing) {
        const videoTrack = localStream.getVideoTracks()[0];
        const groupMembers =
          selectedContact?.groupDetails?.members
            ?.map((member) => member.userId)
            .filter((id) => id !== currentUserId) || [];
        for (const userId of groupMembers) {
          const peer = groupWebRTCServiceRef.current.getPeerConnection(userId);
          if (peer && videoTrack) {
            const sender = peer
              .getSenders()
              .find((s) => s.track?.kind === "video");
            if (sender) {
              await sender.replaceTrack(videoTrack);
              console.log(
                `Screen sharing stopped for ${userId}, reverted to camera`
              );
            }
          }
        }
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          const screenTrack = screenStream.getVideoTracks()[0];
          const groupMembers =
            selectedContact?.groupDetails?.members
              ?.map((member) => member.userId)
              .filter((id) => id !== currentUserId) || [];
          for (const userId of groupMembers) {
            const peer =
              groupWebRTCServiceRef.current.getPeerConnection(userId);
            if (peer) {
              const sender = peer
                .getSenders()
                .find((s) => s.track?.kind === "video");
              if (sender) {
                await sender.replaceTrack(screenTrack);
                console.log(`Screen sharing started for ${userId}`);
              }
            }
          }
          screenTrack.onended = () => {
            const videoTrack = localStream.getVideoTracks()[0];
            for (const userId of groupMembers) {
              const peer =
                groupWebRTCServiceRef.current?.getPeerConnection(userId);
              if (peer && videoTrack) {
                const sender = peer
                  .getSenders()
                  .find((s) => s.track?.kind === "video");
                if (sender) {
                  sender.replaceTrack(videoTrack);
                  console.log(
                    `Screen sharing ended by user for ${userId}, reverted to camera`
                  );
                }
              }
            }
            setIsScreenSharing(false);
            toast.success("Screen sharing ended");
          };
          setIsScreenSharing(true);
          // toast.success('Screen sharing started');
        } catch (error) {
          console.error("Error starting screen share:", error);
          if (
            error instanceof DOMException &&
            error.name === "NotAllowedError"
          ) {
            toast.error(
              "Screen sharing permission denied. Please allow screen sharing in your browser."
            );
          } else {
            toast.error("Failed to start screen sharing");
          }
        }
      }
    }, [isScreenSharing, localStream, selectedContact, currentUserId]);

    const endGroupCall = useCallback(() => {
      console.log("Ending group call");
      setIsCallModalOpen(false);
      setIsVideoCallActive(false);
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setCallType(null);
      setCallId(null);
      setIsAudioMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
      setLocalStream((prev) => {
        prev?.getTracks().forEach((track) => track.stop());
        return null;
      });
      setRemoteStreams(new Map());
      setConnectionStates(new Map());
      groupWebRTCServiceRef.current?.stop();
      isInitialized.current = false;
      videoInitialized.current.clear();
      // remoteVideoRefs.current.clear();
      remoteVideoRefs.current.forEach((video) => {
        video.srcObject = null;
      });
      remoteVideoRefs.current.clear();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      const groupMembers =
        selectedContact?.groupDetails?.members
          ?.map((member) => member.userId)
          .filter((id) => id !== currentUserId) || [];
      const callId = `call-${Date.now()}`;
      for (const userId of groupMembers) {
        socketService.emitGroupCallEnded(
          selectedContact?.groupId || "",
          currentUserId || "",
          userId,
          callType || "video",
          callId || `call-${Date.now()}`
        );
      }
      toast.success("Group call ended");
    }, [selectedContact, currentUserId, callType, setIsVideoCallActive]);

    const startGroupCall = useCallback(
      async (type: "audio" | "video") => {
        if (
          !selectedContact ||
          selectedContact.type !== "group" ||
          !currentUserId ||
          isInitialized.current
        ) {
          console.log(
            "Cannot start group call: Invalid contact, user ID, or already initialized",
            {
              selectedContact,
              currentUserId,
              isInitialized: isInitialized.current,
            }
          );
          toast.error("Cannot start group call");
          return;
        }
        // //SLOT VALIDATION
        // if (!isCurrentTimeInSlot(selectedContact)) {
        //   console.log('Group call attempted outside scheduled slot');
        //   toast.error('Group calls are only available during scheduled slots');
        //   return;
        // }
        isInitialized.current = true;

        try {
          console.log(`Starting group ${type} call`);
          const stream = await navigator.mediaDevices.getUserMedia({
            video:
              type === "video"
                ? { facingMode: "user", width: 640, height: 480 }
                : false,
            audio: true,
          });
          setLocalStream(stream);
          setCallType(type);
          setCallId(`call-${Date.now()}`);
          setIsCallModalOpen(true);
          setIsVideoCallActive(type === "video");
          const groupMembers =
            selectedContact.groupDetails?.members
              ?.map((member) => member.userId)
              .filter((id) => id !== currentUserId) || [];
          for (const userId of groupMembers) {
            const peer =
              groupWebRTCServiceRef.current?.getPeerConnection(userId);
            if (peer) {
              await groupWebRTCServiceRef.current?.addLocalStream(
                userId,
                stream
              );
              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);
              socketService.sendGroupOffer(
                selectedContact.groupId || "",
                currentUserId,
                userId,
                offer,
                type,
                callId || `call-${Date.now()}`
              );
              console.log(`Sent offer to ${userId} for ${type} call`);
            } else {
              console.error(`No peer connection for ${userId}`);
              // toast.error(`No peer connection for ${userId}`);
            }
          }
          // toast.success(`Group ${type} call started`);
        } catch (error) {
          console.error(`Error starting group ${type} call:`, error);
          toast.error(`Failed to start group ${type} call. Check permissions.`);
          endGroupCall();
        }
      },
      [
        selectedContact,
        currentUserId,
        callId,
        setIsVideoCallActive,
        endGroupCall,
      ]
    );

    useEffect(() => {
      if (
        !selectedContact ||
        selectedContact.type !== "group" ||
        !selectedContact.groupId ||
        !currentUserId
      ) {
        console.log("Skipping useEffect: invalid contact or user ID", {
          selectedContact,
          currentUserId,
        });
        return;
      }

      const groupMembers =
        selectedContact.groupDetails?.members
          ?.map((member) => member.userId)
          .filter((id) => id !== currentUserId)
          .slice(0, 3) || [];
      console.log(
        "Group members for peer connection initialization:",
        groupMembers
      );

      groupWebRTCServiceRef.current = new GroupWebRTCService(
        (userId, candidate, callType, callId) => {
          socketService.sendGroupIceCandidate(
            selectedContact.groupId || "",
            currentUserId,
            userId,
            candidate,
            callType,
            callId
          );
        },
        (userId, stream) => {
          console.log(`Updating remote stream for ${userId}`);
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(userId, stream);
            return newMap;
          });
          // const userName = selectedContact.groupDetails?.members?.find(
          //   (member) => member.userId === userId
          // )?.name || userId;
          // console.log(userName)
          // // toast.success(`${userName} joined the call`);
        },
        (userId, state) => {
          console.log(`Connection state updated for ${userId}: ${state}`);
          setConnectionStates((prev) => {
            const newMap = new Map(prev);
            newMap.set(userId, state);
            return newMap;
          });
          if (
            state === "disconnected" ||
            state === "failed" ||
            state === "closed"
          ) {
            // const userName = selectedContact.groupDetails?.members?.find(
            //   (member) => member.userId === userId
            // )?.name || userId;
            // console.log(userName);
            // toast.error(`${userName} left the call`);
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.delete(userId);
              return newMap;
            });
            videoInitialized.current.delete(userId);
            remoteVideoRefs.current.delete(userId);
          }
        }
      );

      groupWebRTCServiceRef.current
        .initGroupCall([...groupMembers, currentUserId], "video")
        .catch((error) => {
          console.error("Failed to initialize group call:", error);
          // toast.error('Failed to initialize group call');
        });

      socketService.joinUserRoom(currentUserId);
      console.log(`Joined user room: user_${currentUserId}`);

      iceCandidateListener.current = (data: GroupIceCandidateData) => {
        if (
          data.groupId === selectedContact.groupId &&
          data.recipientId === currentUserId
        ) {
          const peer = groupWebRTCServiceRef.current?.getPeerConnection(
            data.senderId
          );
          if (peer && peer.remoteDescription) {
            groupWebRTCServiceRef.current
              ?.addIceCandidate(data.senderId, data.candidate)
              .then(() =>
                console.log(
                  `Successfully added ICE candidate from ${data.senderId}`
                )
              )
              .catch((error) => {
                console.error(
                  `Error adding ICE candidate from ${data.senderId}:`,
                  error
                );
                // toast.error('Failed to add ICE candidate');
              });
          } else {
            console.log(
              `Queuing ICE candidate from ${data.senderId} (no remote description yet)`
            );
            const candidates =
              pendingIceCandidates.current.get(data.senderId) || [];
            candidates.push(data.candidate);
            pendingIceCandidates.current.set(data.senderId, candidates);
          }
        }
      };
      socketService.onGroupIceCandidate(iceCandidateListener.current);

      groupOfferListener.current = async (data) => {
        if (
          data.groupId === selectedContact.groupId &&
          data.recipientId === currentUserId
        ) {
          const callerName =
            selectedContact.groupDetails?.members?.find(
              (member) => member.userId === data.senderId
            )?.name || "Unknown";
          setIncomingCallData({ ...data, callerName });
          setIsIncomingCall(true);
          setCallType(data.callType);
          setCallId(data.callId);
          setIsVideoCallActive(data.callType === "video");
          toast(`Incoming ${data.callType} call from ${callerName}`, {
            duration: 30000,
          });
        }
      };
      socketService.onGroupOffer(groupOfferListener.current);

      groupAnswerListener.current = async (data) => {
        if (
          data.groupId === selectedContact.groupId &&
          data.recipientId === currentUserId
        ) {
          const peer = groupWebRTCServiceRef.current?.getPeerConnection(
            data.senderId
          );
          if (!peer) {
            console.error(`No peer connection for sender ${data.senderId}`);
            toast.error("No peer connection available for answer");
            return;
          }
          try {
            await peer.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            console.log(`Set remote answer from ${data.senderId}`);
            const candidates =
              pendingIceCandidates.current.get(data.senderId) || [];
            for (const candidate of candidates) {
              await groupWebRTCServiceRef.current?.addIceCandidate(
                data.senderId,
                candidate
              );
              console.log(
                `Processed queued ICE candidate from ${data.senderId}`
              );
            }
            pendingIceCandidates.current.delete(data.senderId);
          } catch (error) {
            console.error(
              `Error handling group answer from ${data.senderId}:`,
              error
            );
            toast.error("Failed to process group answer");
          }
        }
      };
      socketService.onGroupAnswer(groupAnswerListener.current);

      groupCallEndedListener.current = (data) => {
        if (
          data.groupId === selectedContact.groupId &&
          data.recipientId === currentUserId
        ) {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.senderId);
            return newMap;
          });
          setConnectionStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.senderId);
            return newMap;
          });
          videoInitialized.current.delete(data.senderId);
          remoteVideoRefs.current.delete(data.senderId);
          const userName =
            selectedContact.groupDetails?.members?.find(
              (member) => member.userId === data.senderId
            )?.name || data.senderId;
          toast.error(`${userName} ended the call`);
        }
      };
      socketService.onGroupCallEnded(groupCallEndedListener.current);

      return () => {
        socketService.offGroupIceCandidate(iceCandidateListener.current);
        socketService.offGroupOffer(groupOfferListener.current);
        socketService.offGroupAnswer(groupAnswerListener.current);
        socketService.offGroupCallEnded(groupCallEndedListener.current);
        groupWebRTCServiceRef.current?.stop();
        socketService.leaveUserRoom(currentUserId);
        console.log(`Cleanup: Left user room user_${currentUserId}`);
      };
    }, [selectedContact, currentUserId, setIsVideoCallActive]);

    const declineGroupCall = useCallback(() => {
      console.log("Declining group call");
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setIsVideoCallActive(false);
      setIsCallModalOpen(false);
      groupWebRTCServiceRef.current?.stop();
      setLocalStream((prev) => {
        prev?.getTracks().forEach((track) => track.stop());
        return null;
      });
      setRemoteStreams(new Map());
      setConnectionStates(new Map());
      videoInitialized.current.clear();
      remoteVideoRefs.current.clear();
      if (incomingCallData) {
        socketService.emitGroupCallEnded(
          incomingCallData.groupId,
          currentUserId || "",
          incomingCallData.senderId,
          incomingCallData.callType,
          incomingCallData.callId
        );
        // toast.error(`${incomingCallData.callType.charAt(0).toUpperCase() + incomingCallData.callType.slice(1)} call declined`);
      }
    }, [currentUserId, incomingCallData, setIsVideoCallActive]);

    useEffect(() => {
      let timeout: number;
      if (isIncomingCall && incomingCallData) {
        timeout = setTimeout(() => {
          console.log(
            `Auto-declining ${incomingCallData.callType} group call after 30 seconds`
          );
          declineGroupCall();
        }, 30000);
      }
      return () => clearTimeout(timeout);
    }, [isIncomingCall, incomingCallData, declineGroupCall]);

    useEffect(() => {
      if (
        localStream &&
        localVideoRef.current &&
        !videoInitialized.current.get("local") &&
        callType === "video"
      ) {
        console.log("Setting srcObject for local video");
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current
          .play()
          .then(() => {
            console.log("Local video playing successfully");
          })
          .catch((error) => {
            console.error("Error playing local video:", error);
            // toast.error('Failed to play local video');
          });
        videoInitialized.current.set("local", true);
      }
    }, [localStream, callType, isIncomingCall]);

    useEffect(() => {
      if (!isIncomingCall) {
        remoteStreams.forEach((stream, userId) => {
          const videoElement = remoteVideoRefs.current.get(userId);
          if (videoElement && !videoInitialized.current.get(userId)) {
            console.log(`Setting srcObject for remote video ${userId}`);
            videoElement.srcObject = stream;
            videoElement
              .play()
              .then(() => {
                console.log(`Remote video for ${userId} playing successfully`);
              })
              .catch((error) => {
                console.error(
                  `Error playing remote video for ${userId}:`,
                  error
                );
                toast.error(`Failed to play remote video for ${userId}`);
              });
            videoInitialized.current.set(userId, true);
          }
        });
      }
    }, [remoteStreams, isIncomingCall]);

    const acceptGroupCall = async () => {
      if (
        !selectedContact ||
        !incomingCallData ||
        !groupWebRTCServiceRef.current
      ) {
        console.log("Cannot accept group call: Missing contact or call data");
        // toast.error('Cannot accept group call');
        return;
      }
      //SLOT VALIDATION
      // if (!isCurrentTimeInSlot(selectedContact)) {
      //   console.log('Cannot accept group call: Outside scheduled slot');
      //   toast.error('Group calls can only be accepted during scheduled slots');
      //   declineGroupCall();
      //   return;
      // }

      try {
        console.log(
          `Accepting ${incomingCallData.callType} call from ${incomingCallData.senderId}`
        );
        const peer = groupWebRTCServiceRef.current.getPeerConnection(
          incomingCallData.senderId
        );
        if (!peer) {
          console.error(`No peer connection for ${incomingCallData.senderId}`);
          // toast.error('No peer connection available');
          return;
        }
        await peer.setRemoteDescription(
          new RTCSessionDescription(incomingCallData.offer)
        );
        const stream =
          incomingCallData.callType === "video"
            ? await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
                audio: true,
              })
            : await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        await groupWebRTCServiceRef.current.addLocalStream(
          incomingCallData.senderId,
          stream
        );
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketService.sendGroupAnswer(
          incomingCallData.groupId,
          currentUserId || "",
          incomingCallData.senderId,
          answer,
          incomingCallData.callType,
          incomingCallData.callId
        );
        const candidates =
          pendingIceCandidates.current.get(incomingCallData.senderId) || [];
        for (const candidate of candidates) {
          await groupWebRTCServiceRef.current.addIceCandidate(
            incomingCallData.senderId,
            candidate
          );
          console.log(
            `Processed queued ICE candidate from ${incomingCallData.senderId}`
          );
        }
        pendingIceCandidates.current.delete(incomingCallData.senderId);
        setIsIncomingCall(false);
        setIncomingCallData(null);
        setIsCallModalOpen(true);
        setIsVideoCallActive(incomingCallData.callType === "video");
        // toast.success(`${incomingCallData.callType.charAt(0).toUpperCase() + incomingCallData.callType.slice(1)} call accepted`);
      } catch (error) {
        console.error(
          `Error accepting ${incomingCallData?.callType} call:`,
          error
        );
        toast.error(
          `Failed to accept ${incomingCallData?.callType} call. Check permissions.`
        );
        setIsIncomingCall(false);
        setIncomingCallData(null);
        setIsCallModalOpen(false);
        setIsVideoCallActive(false);
      }
    };

    const getGridLayout = (participantCount: number) => {
      if (participantCount <= 1) return "grid-cols-1";
      if (participantCount === 2) return "grid-cols-2";
      if (participantCount === 3) return "grid-cols-2 sm:grid-cols-3";
      return "grid-cols-2 sm:grid-cols-4";
    };

    const videoGrid = useMemo(() => {
      const participantCount =
        remoteStreams.size + (localStream && callType === "video" ? 1 : 0);
      const gridClass = getGridLayout(participantCount);
      const videos = [];

      if (callType === "video" && localStream) {
        const localUserName =
          selectedContact?.groupDetails?.members?.find(
            (member) => member.userId === currentUserId
          )?.name || "You";
        videos.push(
          <div
            key="local"
            className="relative bg-gray-900 rounded-lg overflow-hidden"
          >
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
        const userName =
          selectedContact?.groupDetails?.members?.find(
            (member) => member.userId === userId
          )?.name || userId;
        videos.push(
          <div
            key={userId}
            className="relative bg-gray-900 rounded-lg overflow-hidden"
          >
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
    }, [
      remoteStreams,
      localStream,
      callType,
      selectedContact,
      currentUserId,
      connectionStates,
    ]);

    return (
      <>
        <Modal isOpen={isIncomingCall} onClose={declineGroupCall}>
          <ModalContent>
            <ModalHeader>
              Incoming{" "}
              {incomingCallData?.callType === "audio" ? "Audio" : "Video"} Call
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
                    Audio call in progress with{" "}
                    {selectedContact?.groupDetails?.groupName}
                  </p>
                  {Array.from(connectionStates.entries()).map(
                    ([userId, state]) => {
                      const userName =
                        selectedContact?.groupDetails?.members?.find(
                          (member) => member.userId === userId
                        )?.name || userId;
                      return (
                        <p key={userId} className="text-white">
                          {userName}: {state}
                        </p>
                      );
                    }
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Tooltip
                content={isAudioMuted ? "Unmute" : "Mute"}
                placement="top"
              >
                <Button
                  isIconOnly
                  color={isAudioMuted ? "danger" : "primary"}
                  onPress={toggleAudio}
                  aria-label={isAudioMuted ? "Unmute" : "Mute"}
                >
                  {isAudioMuted ? (
                    <FaMicrophoneSlash size={16} />
                  ) : (
                    <FaMicrophone size={16} />
                  )}
                </Button>
              </Tooltip>
              {callType === "video" && (
                <>
                  <Tooltip
                    content={isVideoOff ? "Turn video on" : "Turn video off"}
                    placement="top"
                  >
                    <Button
                      isIconOnly
                      color={isVideoOff ? "danger" : "primary"}
                      onPress={toggleVideo}
                      aria-label={
                        isVideoOff ? "Turn video on" : "Turn video off"
                      }
                    >
                      {isVideoOff ? (
                        <FaVideoSlash size={16} />
                      ) : (
                        <FaVideo size={16} />
                      )}
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
                      aria-label={
                        isScreenSharing ? "Stop sharing" : "Share screen"
                      }
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
