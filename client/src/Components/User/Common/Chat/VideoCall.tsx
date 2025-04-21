import React, { useState, useRef, useEffect } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop } from "react-icons/fa";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";
import { Contact } from "../../../../types";

// WebRTCService instance
const webrtcService = new WebRTCService();

interface VideoCallProps {
  selectedContact: Contact;
  getChatKey: (contact: Contact) => string;
  isVideoCallActive: boolean;
  setIsVideoCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDetailsSidebar?: () => void;
  incomingCallData: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit } | null;
  setIncomingCallData: React.Dispatch<React.SetStateAction<{ userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit } | null>>;
  setIsIncomingCall: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoCall: React.FC<VideoCallProps> = ({
  selectedContact,
  getChatKey,
  isVideoCallActive,
  setIsVideoCallActive,
  toggleDetailsSidebar,
  incomingCallData,
  setIncomingCallData,
  setIsIncomingCall,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasProcessedAnswer, setHasProcessedAnswer] = useState(false);
  const [hasCreatedOffer, setHasCreatedOffer] = useState(false);

  // Initialize WebRTC listeners
  useEffect(() => {
    if (!selectedContact || !isVideoCallActive) return;

    console.log("Setting up WebRTC listeners for contact:", selectedContact.id);
    const initWebRTC = async () => {
      const peerConnection = webrtcService.getPeerConnection();
      if (!peerConnection || peerConnection.connectionState === "closed") {
        await webrtcService.initPeerConnection();
      }
      const newPeerConnection = webrtcService.getPeerConnection();
      if (newPeerConnection) {
        newPeerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0];
          console.log("Received remote stream, track details:");
          remoteStream.getTracks().forEach((track, index) => {
            console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
          });
          setRemoteStream(remoteStream);
        };
        newPeerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            const targetId = selectedContact.targetId || selectedContact.groupId || "";
            socketService.sendIceCandidate(targetId, selectedContact.type, getChatKey(selectedContact), event.candidate);
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
      console.error("Error initializing WebRTC:", err);
    });

    const chatKey = getChatKey(selectedContact);

    const handleAnswer = (data: { userId: string; targetId: string; type: string; chatKey: string; answer: RTCSessionDescriptionInit }) => {
      if (data.chatKey === chatKey && webrtcService && !hasProcessedAnswer) {
        console.log("Received answer:", data);
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

    const handleIceCandidate = (data: { userId: string; targetId: string; type: string; chatKey: string; candidate: RTCIceCandidateInit }) => {
      if (data.chatKey === chatKey && webrtcService) {
        console.log("Received ICE candidate:", data);
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
      console.log("Cleaning up socket listeners for chatKey:", chatKey);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("ice-candidate", handleIceCandidate);
    };
  }, [selectedContact, getChatKey, isVideoCallActive]);

  // Cleanup WebRTC on component unmount
  useEffect(() => {
    return () => {
      if (!isVideoCallActive) {
        console.log("Cleaning up WebRTC service on unmount");
        webrtcService.stop();
        setLocalStream(null);
        setRemoteStream(null);
        setHasProcessedAnswer(false);
        setHasCreatedOffer(false);
      }
    };
  }, [isVideoCallActive]);

  // Assign streams to video elements and debug
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

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log("Video track toggled:", videoTrack.enabled ? "on" : "off");
      } else {
        console.warn("No video track available to toggle");
      }
    }
  };

  // Start/stop screen sharing
  const toggleScreenShare = async () => {
    if (!webrtcService || !localStream) {
      console.warn("Cannot toggle screen share: WebRTC service or local stream missing");
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
          }
        }
        screenTrack.onended = () => {
          const videoTrack = localStream.getVideoTracks()[0];
          if (peerConnection && videoTrack) {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(videoTrack);
              console.log("Screen sharing ended by user, reverted to camera");
            }
          }
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error starting screen share:", error);
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          alert("Screen sharing permission denied. Please allow screen sharing in your browser.");
        }
      }
    }
  };

  // Start video call
  const startVideoCall = async () => {
    try {
      console.log("Starting video call for contact:", selectedContact.id);
      const peerConnection = webrtcService.getPeerConnection();
      if (!peerConnection || peerConnection.connectionState === "closed") {
        await webrtcService.initPeerConnection();
      }
      const stream = await webrtcService.getLocalStream();
      setLocalStream(stream);

      if (toggleDetailsSidebar) {
        console.log("Closing details sidebar for video call");
        toggleDetailsSidebar();
      }

      const chatKey = getChatKey(selectedContact);
      const targetId = selectedContact.targetId || selectedContact.groupId || "";
      const offer = await webrtcService.createOffer();
      socketService.sendOffer(targetId, selectedContact.type, chatKey, offer);

      setIsVideoCallActive(true);
      setHasCreatedOffer(true);
      console.log("Video call started successfully");
    } catch (error) {
      console.error("Error starting video call:", error);
      alert("Failed to start video call. Check camera/microphone permissions.");
      setIsVideoCallActive(false);
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
      console.log("Accepting call from:", incomingCallData.userId);
      await webrtcService.setRemoteDescription(incomingCallData.offer);
      const stream = await webrtcService.getLocalStream();
      setLocalStream(stream);
      const answer = await webrtcService.createAnswer();
      socketService.sendAnswer(incomingCallData.userId, selectedContact.type, incomingCallData.chatKey, answer);

      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          console.log("Applying queued ICE candidate after accepting call:", candidate);
          await webrtcService.addIceCandidate(candidate);
        }
      }

      setIsIncomingCall(false);
      setIncomingCallData(null);
      setIsVideoCallActive(true);
      console.log("Call accepted successfully");
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to accept call. Check camera/microphone permissions.");
      setIsIncomingCall(false);
      setIncomingCallData(null);
    }
  };

  // End video call
  const endVideoCall = () => {
    console.log("Ending video call");
    webrtcService.stop();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsVideoCallActive(false);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setHasProcessedAnswer(false);
    setHasCreatedOffer(false);
    console.log("Video call ended");
  };

  // Handle incoming call
  useEffect(() => {
    if (!selectedContact) return;

    const chatKey = getChatKey(selectedContact);
    const handleOffer = (data: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit }) => {
      if (data.chatKey === chatKey && !isVideoCallActive) {
        console.log("Incoming call offer:", data);
        setIncomingCallData(data);
        setIsIncomingCall(true);
      }
    };

    socketService.onOffer(handleOffer);

    return () => {
      console.log("Cleaning up offer listener for chatKey:", chatKey);
      socketService.socket?.off("offer", handleOffer);
    };
  }, [selectedContact, getChatKey, isVideoCallActive, setIncomingCallData, setIsIncomingCall]);

  // Trigger start or accept call based on state
  useEffect(() => {
    if (isVideoCallActive && !localStream && !incomingCallData) {
      startVideoCall();
    } else if (incomingCallData && isVideoCallActive) {
      acceptCall();
    }
  }, [isVideoCallActive, incomingCallData]);

  if (!isVideoCallActive) return null;

  return (
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
  );
};

export default VideoCall;