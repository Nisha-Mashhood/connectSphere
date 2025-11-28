import { useCallback, useEffect, useRef, useState } from "react";
import { WebRTCService } from "../../../../Service/WebRTCService";
import { socketService } from "../../../../Service/SocketService";
import toast from "react-hot-toast";
import { Contact } from "../../../../Interface/User/Icontact";
import { ICallLog } from "../../../../types";
import { getCallLogs } from "../../../../Service/Call.Service";
import ringTone from "../../../../assets/ringTone.mp3";

const webrtcService = new WebRTCService();

type CallType = "audio" | "video";

interface IncomingCallData {
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
  //CALL LOGS
  const [callLogs, setCallLogs] = useState<ICallLog[]>([]);

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

  //RINGTONE
  const ringtone = useRef<HTMLAudioElement | null>(null);
  const isRingtonePlaying = useRef(false);

  useEffect(() => {
    if (ringtone.current) {
      ringtone.current.src = ringTone;
      ringtone.current.load();
    }
  }, []);

  const playRingtone = useCallback(async () => {
    if (!ringtone.current || isRingtonePlaying.current) return;
    try {
      isRingtonePlaying.current = true;
      ringtone.current.currentTime = 0;
      await ringtone.current.play();
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        toast.error("Click anywhere to enable sound", { duration: 4000 });
      }
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtone.current && isRingtonePlaying.current) {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
      isRingtonePlaying.current = false;
    }
  }, []);

  //MEDIA REFS
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

  //END CALL
  const endCall = useCallback(
    (fromRemote: boolean = false) => {
      // Stop WebRTC & local media
      webrtcService.stop();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      setLocalStream(null);
      setRemoteStream(null);
      setIsAudioCallActive(false);
      setIsVideoCallActive(false);
      setIsAudioMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
      setIsIncomingCall(false);
      setIncomingCallData(null);
      stopRingtone();

      if (!fromRemote && selectedContact && chatKey) {
        socketService.emitCallEnded({
          userId: selectedContact.userId || "",
          targetId: selectedContact.targetId || selectedContact.groupId || "",
          type: selectedContact.type,
          chatKey,
          callType: isVideoCallActive ? "video" : "audio",
        });
      }
    },
    [
      chatKey,
      isVideoCallActive,
      selectedContact,
      stopRingtone,
    ]
  );

  useEffect(() => {
    return () => {
      webrtcService.stop();
      stopRingtone();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  //ASSIGN STREAMS TO ELEMENTS
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (localAudioRef.current) localAudioRef.current.srcObject = localStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  //SETUP WEBRTC + SOCKETS
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
      // Ensure peer connection exists
      await webrtcService.initPeerConnection();

      // WebRTC: remote track handler (single connection)
      webrtcService.onTrack("single", (event) => {
        if (!isMounted) return;
        const stream = event.streams[0];
        if (stream) {
          console.log(
            "REMOTE TRACK (single) RECEIVED — attaching to remoteStream + VIDEO TAG"
          );

          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }

          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
          }
        }
      });

      //  WebRTC: ICE candidate
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

    //Socket event handlers
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
      setIsIncomingCall(true);
      playRingtone();
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
    playRingtone,
    endCall,
  ]);

  //START CALLS
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
      await webrtcService.initPeerConnection("single", true);
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
  }, [chatKey, isAudioCallActive, isVideoCallActive, selectedContact, endCall]);

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
      await webrtcService.initPeerConnection("single", true);
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
  }, [chatKey, isAudioCallActive, isVideoCallActive, selectedContact, endCall]);

  //ACCEPT INCOMING CALL
  const acceptCall = useCallback(async () => {
    if (!incomingCallData || !chatKey || !selectedContact) return;

    try {
      await webrtcService.initPeerConnection("single", true);

      // Apply remote offer
      await webrtcService.setRemoteDescription(incomingCallData.offer);

      // Get local media & attach
      const stream =
        incomingCallData.callType === "audio"
          ? await webrtcService.getLocalAudioStream()
          : await webrtcService.getLocalStream();

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream
        .getTracks()
        .forEach((track) => webrtcService.addTrack("single", track, stream));

      //Create & send answer
      const answer = await webrtcService.createAnswer();

      socketService.sendAnswer({
        userId: selectedContact.userId || "",
        targetId: incomingCallData.userId,
        type: selectedContact.type,
        chatKey,
        answer,
        callType: incomingCallData.callType,
      });

      setIsIncomingCall(false);
      setIncomingCallData(null);
      stopRingtone();

      if (incomingCallData.callType === "audio") setIsAudioCallActive(true);
      else setIsVideoCallActive(true);
    } catch (err) {
      console.error("Accept call failed:", err);
      toast.error("Failed to accept call");
      endCall();
    }
  }, [incomingCallData, chatKey, selectedContact, stopRingtone, endCall]);

  //DECLINE CALL
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
    stopRingtone();
    webrtcService.stop();
  }, [incomingCallData, chatKey, selectedContact, stopRingtone]);

  //TOGGLE CONTROLS
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

  //AUTO DECLINE AFTER 30 SECONDS
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
    ringtone,

    startVideoCall,
    startAudioCall,
    endCall,
    acceptCall,
    declineCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
