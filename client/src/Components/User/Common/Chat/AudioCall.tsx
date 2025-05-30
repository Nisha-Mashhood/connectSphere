import React, { useState, useRef, useEffect } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";
import { Contact } from "../../../../types";

// WebRTCService instance
const webrtcService = new WebRTCService();

interface AudioCallProps {
  selectedContact: Contact;
  getChatKey: (contact: Contact) => string;
  isAudioCallActive: boolean;
  setIsAudioCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  incomingCallData: {
    userId: string;
    targetId: string;
    type: string;
    chatKey: string;
    offer: RTCSessionDescriptionInit;
    callType: "audio" | "video";
  } | null;
  setIncomingCallData: React.Dispatch<
    React.SetStateAction<{
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    } | null>
  >;
  setIsIncomingCall: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioCall: React.FC<AudioCallProps> = ({
  selectedContact,
  getChatKey,
  isAudioCallActive,
  setIsAudioCallActive,
  incomingCallData,
  setIncomingCallData,
  setIsIncomingCall,
}) => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasProcessedAnswer, setHasProcessedAnswer] = useState(false);
  const [hasCreatedOffer, setHasCreatedOffer] = useState(false);

  // Initialize WebRTC listeners
  useEffect(() => {
    if (!selectedContact || !isAudioCallActive) return;

    console.log("Setting up WebRTC listeners for audio call:", selectedContact.id);
    const initWebRTC = async () => {
      const peerConnection = webrtcService.getPeerConnection();
      if (!peerConnection || peerConnection.connectionState === "closed") {
        await webrtcService.initPeerConnection();
      }
      const newPeerConnection = webrtcService.getPeerConnection();
      if (newPeerConnection) {
        newPeerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0];
          console.log("Received remote audio stream, track details:");
          remoteStream.getTracks().forEach((track, index) => {
            console.log(
              `Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`
            );
          });
          setRemoteStream(remoteStream);
        };
        newPeerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            const targetId = selectedContact.targetId || selectedContact.groupId || "";
            socketService.sendIceCandidate(targetId, selectedContact.type, getChatKey(selectedContact), event.candidate, "audio");
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
        };
      }
    };
    initWebRTC().catch((err) => {
      console.error("Error initializing WebRTC for audio call:", err);
    });

    const chatKey = getChatKey(selectedContact);

    const handleAnswer = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      answer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    }) => {
      if (data.chatKey === chatKey && data.callType === "audio" && webrtcService && !hasProcessedAnswer) {
        console.log("Received audio answer:", data);
        const peerConnection = webrtcService.getPeerConnection();
        if (peerConnection && peerConnection.signalingState !== "have-local-offer") {
          console.warn(`Cannot set remote answer: Invalid signaling state (${peerConnection.signalingState})`);
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
              });
            }
          }
        }).catch((error) => {
          console.error("Error setting remote description for answer:", error);
        });
      } else if (hasProcessedAnswer) {
        console.warn("Ignoring duplicate answer for chatKey:", chatKey);
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
      if (data.chatKey === chatKey && data.callType === "audio" && webrtcService) {
        console.log("Received audio ICE candidate:", data);
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
        });
      }
    };

    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);

    return () => {
      console.log("Cleaning up socket listeners for audio call, chatKey:", chatKey);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("ice-candidate", handleIceCandidate);
    };
  }, [selectedContact, getChatKey, isAudioCallActive]);

  // Cleanup WebRTC on component unmount
  useEffect(() => {
    return () => {
      if (!isAudioCallActive) {
        console.log("Cleaning up WebRTC service on unmount");
        webrtcService.stop();
        setLocalStream(null);
        setRemoteStream(null);
        setHasProcessedAnswer(false);
        setHasCreatedOffer(false);
      }
    };
  }, [isAudioCallActive]);

  // Assign streams to audio elements
  useEffect(() => {
    if (isAudioCallActive && localStream && localAudioRef.current) {
      console.log("useEffect: Assigning local audio stream, tracks:", localStream.getTracks());
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.play().then(() => {
        console.log("Local audio playing successfully");
      }).catch((err) => {
        console.error("Error playing local audio:", err);
      });
    }
    if (isAudioCallActive && remoteStream && remoteAudioRef.current) {
      console.log("useEffect: Assigning remote audio stream, tracks:", remoteStream.getTracks());
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().then(() => {
        console.log("Remote audio playing successfully");
      }).catch((err) => {
        console.error("Error playing remote audio:", err);
      });
    }
  }, [isAudioCallActive, localStream, remoteStream]);

  // Toggle audio mute
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        console.log("Audio track toggled:", audioTrack.enabled ? "unmuted" : "muted");
      } else {
        console.warn("No audio track available to toggle");
      }
    }
  };

  // Start audio call
  const startAudioCall = async () => {
    try {
      console.log("Starting audio call for contact:", selectedContact.id);
      const peerConnection = webrtcService.getPeerConnection();
      if (!peerConnection || peerConnection.connectionState === "closed") {
        await webrtcService.initPeerConnection();
      }
      const stream = await webrtcService.getLocalAudioStream();
      setLocalStream(stream);

      const chatKey = getChatKey(selectedContact);
      const targetId = selectedContact.targetId || selectedContact.groupId || "";
      const offer = await webrtcService.createOffer();
      socketService.sendOffer(targetId, selectedContact.type, chatKey, offer, "audio");

      setIsAudioCallActive(true);
      setHasCreatedOffer(true);
      console.log("Audio call started successfully");
    } catch (error) {
      console.error("Error starting audio call:", error);
      alert("Failed to start audio call. Check microphone permissions.");
      setIsAudioCallActive(false);
      setLocalStream(null);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCallData || !webrtcService) {
      console.log("Cannot accept call: Missing call data");
      return;
    }

    try {
      console.log("Accepting audio call from:", incomingCallData.userId);
      await webrtcService.setRemoteDescription(incomingCallData.offer);
      const stream = await webrtcService.getLocalAudioStream();
      setLocalStream(stream);
      const answer = await webrtcService.createAnswer();
      socketService.sendAnswer(incomingCallData.userId, selectedContact.type, incomingCallData.chatKey, answer, "audio");

      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          console.log("Applying queued ICE candidate after accepting call:", candidate);
          await webrtcService.addIceCandidate(candidate);
        }
      }

      setIsIncomingCall(false);
      setIncomingCallData(null);
      setIsAudioCallActive(true);
      console.log("Audio call accepted successfully");
    } catch (error) {
      console.error("Error accepting audio call:", error);
      alert("Failed to accept audio call. Check microphone permissions.");
      setIsIncomingCall(false);
      setIncomingCallData(null);
    }
  };

  // End audio call
  const endAudioCall = () => {
    console.log("Ending audio call");
    webrtcService.stop();
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioCallActive(false);
    setIsAudioMuted(false);
    setHasProcessedAnswer(false);
    setHasCreatedOffer(false);
    console.log("Audio call ended");
  };

  // Handle incoming call
  useEffect(() => {
    if (!selectedContact) return;

    const chatKey = getChatKey(selectedContact);
    const handleOffer = (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    }) => {
      if (data.chatKey === chatKey && !isAudioCallActive && data.callType === "audio") {
        console.log("Incoming audio call offer:", data);
        setIncomingCallData(data);
        setIsIncomingCall(true);
      }
    };

    socketService.onOffer(handleOffer);

    return () => {
      console.log("Cleaning up offer listener for audio call, chatKey:", chatKey);
      socketService.socket?.off("offer", handleOffer);
    };
  }, [selectedContact, getChatKey, isAudioCallActive, setIncomingCallData, setIsIncomingCall]);

  // Trigger start or accept call based on state
  useEffect(() => {
    if (isAudioCallActive && !localStream && !incomingCallData) {
      startAudioCall();
    } else if (incomingCallData && isAudioCallActive) {
      acceptCall();
    }
  }, [isAudioCallActive, incomingCallData]);

  if (!isAudioCallActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="bg-gray-900 rounded-lg p-4 w-full text-center">
          <p className="text-white text-lg font-semibold">Audio Call with {selectedContact.name}</p>
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
  );
};

export default AudioCall;