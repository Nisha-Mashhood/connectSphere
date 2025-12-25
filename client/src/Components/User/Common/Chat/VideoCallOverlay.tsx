import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
} from "react-icons/fa";

interface VideoCallOverlayProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  endCall: () => void;
  remoteName: string;
  isCallInProgress: boolean;
  className: string;
}

const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  localVideoRef,
  remoteVideoRef,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  endCall,
  remoteName,
  isCallInProgress,
  className,
}) => {
  const [isSwapped, setIsSwapped] = useState(false);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isRemotePlaying, setIsRemotePlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<number | null>(null);

  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;
    const onPlaying = () => setIsLocalPlaying(true);
    video.addEventListener("playing", onPlaying);
    if (video.readyState >= 3) setIsLocalPlaying(true);
    return () => video.removeEventListener("playing", onPlaying);
  }, [localVideoRef]);

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    const onPlaying = () => setIsRemotePlaying(true);
    video.addEventListener("playing", onPlaying);
    if (video.readyState >= 3) setIsRemotePlaying(true);
    return () => video.removeEventListener("playing", onPlaying);
  }, [remoteVideoRef]);

  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimer();
    const handleMove = () => resetTimer();
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchstart", handleMove);

    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchstart", handleMove);
    };
  }, []);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setDragStart({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }

    setIsDragging(true);
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragRef.current) return;

    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const parent = dragRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const pipRect = dragRef.current.getBoundingClientRect();

    let x = clientX - parentRect.left - dragStart.x;
    let y = clientY - parentRect.top - dragStart.y;

    const maxX = parentRect.width - pipRect.width;
    const maxY = parentRect.height - pipRect.height;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    setPosition({ x, y });
  }, [isDragging, dragStart]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleEnd, handleMove]);

  const handlePipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsSwapped(!isSwapped);
    }
  };

  const isDefaultPosition = position.x === 0 && position.y === 0;

  return (
    <div className={`fixed inset-0 bg-black z-[1000] flex flex-col pt-[5.5rem] ${className}`}>
      <div className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl bg-black mx-4 mb-4">
        {/* Main Large Video */}
        <video
          ref={isSwapped ? localVideoRef : remoteVideoRef}
          autoPlay
          playsInline
          muted={isSwapped}
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />

        {/* Top Bar - Above Video */}
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 transition-all duration-300 z-40 ${
            showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-white text-xl font-semibold tracking-wide">
                {isSwapped ? "You" : remoteName}
              </p>
            </div>
            <div className="text-white/60 text-sm font-medium">
              Call in progress
            </div>
          </div>
        </div>

        {/* Connecting Spinner */}
        {!(isSwapped ? isLocalPlaying : isRemotePlaying) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-40">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-white text-xl font-medium">Connecting...</p>
            <p className="mt-2 text-white/60 text-sm">Please wait</p>
          </div>
        )}

        {/* Draggable PiP */}
        <div
          ref={dragRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onClick={handlePipClick}
          className={`
            absolute w-56 h-72 rounded-2xl overflow-hidden shadow-2xl cursor-move z-30
            transition-all duration-300
            ${isDragging ? "scale-105 shadow-blue-500/50" : "scale-100 hover:scale-105"}
          `}
          style={{
            top: isDefaultPosition ? "auto" : `${position.y}px`,
            left: isDefaultPosition ? "auto" : `${position.x}px`,
            bottom: isDefaultPosition ? "2rem" : "auto",
            right: isDefaultPosition ? "1.5rem" : "auto",
          }}
        >
          <div className="absolute inset-0 rounded-2xl border-3 border-white/40 pointer-events-none z-10" />
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none transition-opacity ${
              isDragging ? "opacity-100" : "opacity-0"
            }`}
          />

          <video
            ref={isSwapped ? remoteVideoRef : localVideoRef}
            autoPlay
            playsInline
            muted={!isSwapped}
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              {isSwapped ? remoteName : "You"}
              {!isSwapped && isAudioMuted && (
                <FaMicrophoneSlash className="text-red-400" size={12} />
              )}
            </p>
          </div>

          <div className="absolute top-2 right-2 pointer-events-none">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                <div className="w-1 h-1 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls - HIGHEST among overlay elements */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8 flex justify-center items-center gap-6 transition-all duration-300 z-50 ${
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={toggleAudio}
            className={`group relative p-5 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 ${
              isAudioMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-lg"
            }`}
            title={isAudioMuted ? "Unmute" : "Mute"}
          >
            {isAudioMuted ? (
              <FaMicrophoneSlash className="text-white" size={24} />
            ) : (
              <FaMicrophone className="text-white" size={24} />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`group relative p-5 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-lg"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? (
              <FaVideoSlash className="text-white" size={24} />
            ) : (
              <FaVideo className="text-white" size={24} />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`group relative p-5 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 ${
              isScreenSharing
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-lg"
            }`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <FaDesktop className="text-white" size={24} />
          </button>
            {isCallInProgress && (
          <button
            onClick={endCall}
            className="relative px-12 py-5 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 transform hover:scale-110 active:scale-95 font-semibold text-white text-lg shadow-lg shadow-red-500/50"
          >
            End Call
          </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallOverlay;