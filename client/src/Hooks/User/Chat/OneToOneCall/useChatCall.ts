import { useCallback, useEffect, useRef, useState } from "react";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";
import toast from "react-hot-toast";
import { Contact } from "../../../../Interface/User/Icontact";
import { ICallLog } from "../../../../types";
import { getCallLogs } from "../../../../Service/Call.Service";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../../../redux/store";
import { clearIncomingCall, setIncomingCall } from "../../../../redux/Slice/callSlice";

const webrtcService = new WebRTCService();

type CallType = "audio" | "video";

export interface IncomingCallData {
  userId: string;
  targetId: string;
  type: string;
  chatKey: string;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
  senderName?: string;
}

interface UseChatCallParams {
  currentUserId?: string;
  selectedContact: Contact | null;
  getChatKey: (contact: Contact) => string;
}

export const useChatCall = ({
  currentUserId,
  selectedContact,
  getChatKey,
}: UseChatCallParams) => {
  // CALL LOGS
  const [callLogs, setCallLogs] = useState<ICallLog[]>([]);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isRemotePlaying, setIsRemotePlaying] = useState(false);
  const incomingCall = useSelector((state: RootState) => state.call.incomingCall);
  const dispatch = useDispatch();

  const fetchCallLogs = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const logs = await getCallLogs();
      setCallLogs(logs);
    } catch (err) {
      console.error("Error loading call logs:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  // MEDIA REFS
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] =
    useState<IncomingCallData | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // CHAT KEY
  const chatKey = selectedContact ? getChatKey(selectedContact) : null;

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  // END CALL
  const endCall = useCallback(
  (fromRemote: boolean = false) => {

    //  Notify the other side FIRST
    if (!fromRemote && selectedContact && chatKey) {
      socketService.emitCallEnded({
        userId: selectedContact.userId || "",
        targetId:
          selectedContact.targetId ||
          selectedContact.groupId ||
          "",
        type: selectedContact.type,
        chatKey,
        callType: isVideoCallActive ? "video" : "audio",
      });
    }

    // Stop WebRTC 
    webrtcService.stop();

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    remoteStreamRef.current?.getTracks().forEach(t => t.stop());

    // Reset ALL local state
    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioCallActive(false);
    setIsVideoCallActive(false);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIncomingCallData(null);
    setIsIncomingCall(false);
    setIsLocalPlaying(false);
    setIsRemotePlaying(false);

    // Stop ringtone globally
    dispatch(clearIncomingCall());

  },
  [chatKey, selectedContact, isVideoCallActive, dispatch]
);

  useEffect(() => {
    return () => {
      webrtcService.stop();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

useEffect(() => {
  if (localVideoRef.current && localStream) {
    localVideoRef.current.srcObject = localStream;
    localVideoRef.current.muted = true;
    localVideoRef.current.play().catch(() => {});
  }
}, [localStream, localVideoRef]);

useEffect(() => {
  if (remoteVideoRef.current && remoteStream) {
    remoteVideoRef.current.srcObject = remoteStream;
    remoteVideoRef.current.muted = false;
    remoteVideoRef.current.play().catch(() => {});
  }
}, [remoteStream, remoteVideoRef]);

  useEffect(() => {
    console.log("Video refs:", {
      localVideo: !!localVideoRef.current,
      remoteVideo: !!remoteVideoRef.current,
      localStreamTracks: localStream?.getTracks().map((t) => t.kind) || null,
      remoteStreamTracks: remoteStream?.getTracks().map((t) => t.kind) || null,
    });
  }, [localStream, remoteStream, isVideoCallActive]);

  // Detect when local video starts playing
useEffect(() => {
  if (!localVideoRef.current) return;

  const video = localVideoRef.current;

  const onPlaying = () => {
    setIsLocalPlaying(true);
    console.log("✅ Local video confirmed playing");
  };

  video.addEventListener("playing", onPlaying);

  // Also check immediately if already playing
  if (video.readyState >= 3) {
    setIsLocalPlaying(true);
  }

  const timeout = setTimeout(() => {
    if (localStream) setIsLocalPlaying(true);
  }, 5000);

  return () => {
    video.removeEventListener("playing", onPlaying);
    clearTimeout(timeout);
  };
}, [localStream, localVideoRef]);

useEffect(() => {
  if (!remoteVideoRef.current) return;

  const video = remoteVideoRef.current;

  const onPlaying = () => {
    setIsRemotePlaying(true);
    console.log("✅ Remote video confirmed playing");
  };

  video.addEventListener("playing", onPlaying);

  if (video.readyState >= 3) {
    setIsRemotePlaying(true);
  }

  const timeout = setTimeout(() => {
    if (remoteStream) setIsRemotePlaying(true);
  }, 15000);

  return () => {
    video.removeEventListener("playing", onPlaying);
    clearTimeout(timeout);
  };
}, [remoteStream, remoteVideoRef]);


useEffect(() => {   
  const attach = () => {     
    if (localVideoRef.current && localStream) {       
      localVideoRef.current.srcObject = localStream;       
      localVideoRef.current.muted = true;       
      localVideoRef.current.play().catch(() => {});       
      console.log("✅ Local video attached and playing");     
    }   
  };
  // Run immediately   
  attach();
  // If video element appears later catch it  
   const observer = new MutationObserver(attach);
  // Observe the parent of where  will be 
  const parent = document.getElementById('root') || document.body; 
  observer.observe(parent, { childList: true, subtree: true });

  return () => observer.disconnect(); 
}, [localStream, localVideoRef]);



useEffect(() => {   
  const attach = () => {    
     if (remoteVideoRef.current && remoteStream) {       
      remoteVideoRef.current.srcObject = remoteStream;       
      remoteVideoRef.current.muted = false;       
      remoteVideoRef.current.play().catch(() => {});       
      console.log("✅ Remote video attached and playing");     
    }   
  };

  attach();

  const observer = new MutationObserver(attach);   
  const parent = document.getElementById('root') || document.body;   
  observer.observe(parent, { childList: true, subtree: true });

  return () => observer.disconnect(); 
}, [remoteStream, remoteVideoRef]);

// ACCEPT INCOMING CALL
  const acceptCall = useCallback(async () => {
  if (!incomingCallData || !chatKey || !selectedContact) return;

  try {
    await webrtcService.initPeerConnection("single");

    //Get local stream FIRST
    const stream =
      incomingCallData.callType === "audio"
        ? await webrtcService.getLocalAudioStream()
        : await webrtcService.getLocalStream();

    setLocalStream(stream);

    if (incomingCallData.callType === "audio") {
      setIsAudioCallActive(true);
    } else {
      setIsVideoCallActive(true); 
    }

    //Add local tracks
    stream.getTracks().forEach((track) => {
      webrtcService.addTrack("single", track, stream);
      console.log("Added local track to PC:", track.kind, track.id);
    });

    //Set remote description 
    await webrtcService.setRemoteDescription(incomingCallData.offer);

    //Create answer
    const answer = await webrtcService.createAnswer();

    //Send answer
    socketService.sendAnswer({
      userId: selectedContact.userId || "",
      targetId: incomingCallData.userId,
      type: selectedContact.type,
      chatKey,
      answer,
      callType: incomingCallData.callType,
    });

    // Hide incoming modal + stop ringtone
    setIsIncomingCall(false);
    setIncomingCallData(null);
    dispatch(clearIncomingCall());

  } catch (err) {
    console.error("Accept call failed:", err);
    toast.error("Failed to accept call");
    endCall();
  }
}, [incomingCallData, chatKey, selectedContact, endCall, dispatch]);

// Auto-accept when coming from other pages
useEffect(() => {
  if (
    incomingCall?.shouldAutoAnswer &&
    incomingCall?.offerData &&
    incomingCall.offerData.chatKey === chatKey &&
    incomingCall.offerData.targetId === currentUserId
  ) {
    // Save data and answer
    setIncomingCallData(incomingCall.offerData);

    setTimeout(() => {
      acceptCall();
      dispatch(clearIncomingCall());
    }, 300);
  }
}, [incomingCall, chatKey, currentUserId, acceptCall, dispatch]);

  // SETUP WEBRTC + SOCKETS
  useEffect(() => {
    if (
      !selectedContact ||
      !chatKey ||
      selectedContact.type === "group" ||
      !currentUserId
    ) {
      return;
    }

    let isMounted = true;

    const setup = async () => {
      await webrtcService.initPeerConnection();
      webrtcService.onTrack("single", (event) => {
        if (!isMounted) return;
        const stream = event.streams[0];
        if (!stream) return;

        console.log(
          "onTrack: remote stream received, tracks:",
          stream.getTracks().map((t) => t.kind)
        );
        setRemoteStream(stream);
      });

      // WebRTC: ICE candidate
      webrtcService.onIceCandidate("single", (candidate) => {
        if (!isMounted || !selectedContact || !chatKey || !candidate) return;

        socketService.sendIceCandidate({
          userId: selectedContact.userId || "",
          targetId: selectedContact.targetId || selectedContact.groupId || "",
          type: selectedContact.type,
          chatKey,
          candidate,
          callType: isVideoCallActive ? "video" : "audio",
        });
      });
    };

    setup();

    // Socket event handlers
    const handleOffer = (data: IncomingCallData) => {
      if (
        !isMounted ||
        data.chatKey !== chatKey ||
        data.targetId !== currentUserId ||
        isAudioCallActive ||
        isVideoCallActive
      ) {
        return;
      }

      console.log("Incoming OFFER for me:", data);
      setIncomingCallData(data);
      dispatch(setIncomingCall({
        senderId: data.userId,
        senderName: data.senderName || "Someone",
        callType: data.callType,
        contactType: data.type as 'user-user' | 'user-mentor',
        offerData: data,
        shouldAutoAnswer: false,
      }));
    };

    const handleAnswer = async (data: {
      answer: RTCSessionDescriptionInit;
      chatKey: string;
    }) => {
      if (!isMounted || data.chatKey !== chatKey) return;

      console.log("Received ANSWER for my offer");
      try {
        await webrtcService.setRemoteDescription(data.answer);
      } catch (err) {
        console.error("Failed to set remote answer:", err);
      }
    };

    const handleIceCandidate = (data: {
      candidate: RTCIceCandidateInit;
      chatKey: string;
    }) => {
      if (!isMounted || data.chatKey !== chatKey) return;

      console.log("ICE from remote, adding via WebRTCService");
      webrtcService
        .addIceCandidate(data.candidate)
        .catch((err) => console.warn("Failed to add ICE candidate:", err));
    };

    const handleCallEnded = () => {
      if (!isMounted) return;
      console.log("Call ended received from remote");
      endCall(true);
    };

    // Register all socket listeners
    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallEnded(handleCallEnded);

    return () => {
      isMounted = false;
      socketService.offOffer(handleOffer);
      socketService.offAnswer(handleAnswer);
      socketService.offIceCandidate(handleIceCandidate);
      socketService.offCallEnded(handleCallEnded);
    };
  }, [
    chatKey,
    currentUserId,
    selectedContact,
    isAudioCallActive,
    isVideoCallActive,
    endCall,
    dispatch,
  ]);

  // START CALLS
  const startVideoCall = useCallback(async () => {
    if (
      !selectedContact ||
      selectedContact.type === "group" ||
      isAudioCallActive ||
      isVideoCallActive ||
      !chatKey
    ) {
      return;
    }


    try {
      await webrtcService.initPeerConnection("single");
      const stream = await webrtcService.getLocalStream();
      setLocalStream(stream);
      stream
        .getTracks()
        .forEach((track) => webrtcService.addTrack("single", track, stream));
      const offer = await webrtcService.createOffer();
      socketService.sendOffer({
        userId: selectedContact.userId || "",
        targetId: selectedContact.targetId || "",
        type: selectedContact.type,
        chatKey,
        offer,
        callType: "video",
      });
      setIsVideoCallActive(true);
    } catch (err) {
      console.error(err);
      toast.error("Camera/Microphone access denied");
      endCall();
    }
  }, [
    chatKey,
    isAudioCallActive,
    isVideoCallActive,
    selectedContact,
    endCall,
  ]);

  const startAudioCall = useCallback(async () => {
    if (
      !selectedContact ||
      selectedContact.type === "group" ||
      isAudioCallActive ||
      isVideoCallActive ||
      !chatKey
    ) {
      return;
    }

    try {
      await webrtcService.initPeerConnection("single");
      const stream = await webrtcService.getLocalAudioStream();
      setLocalStream(stream);
      stream
        .getTracks()
        .forEach((track) => webrtcService.addTrack("single", track, stream));
      const offer = await webrtcService.createOffer();
      socketService.sendOffer({
        userId: selectedContact.userId || "",
        targetId: selectedContact.targetId || "",
        type: selectedContact.type,
        chatKey,
        offer,
        callType: "audio",
      });
      setIsAudioCallActive(true);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied");
      endCall();
    }
  }, [
    chatKey,
    isAudioCallActive,
    isVideoCallActive,
    selectedContact,
    endCall,
  ]);


  // DECLINE CALL
  const declineCall = useCallback(() => {
    if (!incomingCallData || !chatKey || !selectedContact) return;

    socketService.emitCallEnded({
      userId: selectedContact.userId || "",
      targetId: incomingCallData.userId,
      type: selectedContact.type,
      chatKey,
      callType: incomingCallData.callType,
    });

    setIsIncomingCall(false);
    setIncomingCallData(null);
    webrtcService.stop();
  }, [incomingCallData, chatKey, selectedContact]);

  // TOGGLE CONTROLS
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = webrtcService.getPeerConnection();
    if (!localStreamRef.current || !pc) return;

    if (isScreenSharing) {
      // Switch back to camera
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = async () => {
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
          if (sender && cameraTrack) {
            await sender.replaceTrack(cameraTrack);
          }
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error(err);
        toast.error("Screen sharing cancelled");
      }
    }
  }, [isScreenSharing]);

  // AUTO DECLINE AFTER 30 SECONDS
  useEffect(() => {
    if (!isIncomingCall) return;
    const timer = setTimeout(() => declineCall(), 30000);
    return () => clearTimeout(timer);
  }, [isIncomingCall, declineCall]);

  return {
    callLogs,
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
    isLocalPlaying,
  isRemotePlaying,
  };
};
