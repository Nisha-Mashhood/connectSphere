import { useCallback, useEffect, useRef, useState } from "react";
import { socketService } from "../../../Service/SocketService";
import { fetchUserDetails } from "../../../Service/Auth.service";
import ringTone from "../../../assets/ringTone.mp3";
import { ICallLog } from "../../../types";
import { getCallLogs } from "../../../Service/Call.Service";

export const useChatCall = (userId?: string) => {
  const [callLogs, setCallLogs] = useState<ICallLog[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    userId: string;
    chatKey: string;
    callType: "audio" | "video";
    callerName: string;
  } | null>(null);

  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const ringtone = useRef<HTMLAudioElement | null>(null);
  const isRingtonePlaying = useRef(false);

  // ---------------- Load ringtone ----------------
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
      console.error("Ringtone play error:", err);
    }
  }, []);

  // ---------------- Fetch call logs ----------------
  const fetchCallLogs = useCallback(async () => {
    try {
      const logs = await getCallLogs();
      setCallLogs(logs);
    } catch (err) {
      console.error("Error loading call logs:", err);
    }
  }, []);

  // ---------------- Socket event handlers ----------------
  useEffect(() => {
    if (!userId) return;

    const handleOffer = async (data) => {
      const caller = await fetchUserDetails(data.userId);
      const callerName = caller?.userDetails?.name || "Unknown";

      setIncomingCall({
        userId: data.userId,
        chatKey: data.chatKey,
        callType: data.callType,
        callerName,
      });

      // play ringtone automatically
      playRingtone();
    };

    const handleAnswer = () => {
      // stop ringtone
      if (ringtone.current) {
        ringtone.current.pause();
        isRingtonePlaying.current = false;
      }

      setIsVideoCallActive(true);
      setIncomingCall(null);
    };

    const handleCallEnded = () => {
      setIsVideoCallActive(false);
      setIncomingCall(null);

      if (ringtone.current) {
        ringtone.current.pause();
        isRingtonePlaying.current = false;
      }
    };

    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onCallEnded(handleCallEnded);

    // load logs initially
    fetchCallLogs();

    return () => {
      socketService.socket?.off("offer", handleOffer);
      socketService.socket?.off("answer", handleAnswer);
      socketService.socket?.off("callEnded", handleCallEnded);
    };
  }, [userId, fetchCallLogs, playRingtone]);

  return {
    // Call State
    callLogs,
    incomingCall,
    isVideoCallActive,

    // Ringtone
    ringtone,
    playRingtone,
    isRingtonePlaying,

    // Call Actions for Chat.tsx
    setIsVideoCallActive,
    setIncomingCall,
  };
};
