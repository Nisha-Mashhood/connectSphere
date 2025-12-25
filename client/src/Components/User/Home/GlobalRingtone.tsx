import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import ringTone from "../../../assets/ringTone.mp3";

const GlobalRingtone: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const incomingCall = useSelector((state: RootState) => state.call.incomingCall);

  useEffect(() => {
    if (!audioRef.current) return;

    if (incomingCall) {
      // Play ringtone when call comes
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Ringtone play prevented (user interaction needed):", err);
        // Common on mobile — needs user tap first
      });
    } else {
      // Stop when call ends/answered/declined
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [incomingCall]);

  return (
    <audio
      ref={audioRef}
      src={ringTone}
      loop
      preload="auto"
      style={{ display: "none" }}
    />
  );
};

export default GlobalRingtone;