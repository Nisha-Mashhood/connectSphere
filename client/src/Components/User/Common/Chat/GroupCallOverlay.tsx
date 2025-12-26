import React from "react";

interface GroupCallOverlayProps {
  roomName: string; // group ID
  userName: string; // Current user's name
  onClose: () => void; // Function to close the call
}

const GroupCallOverlay: React.FC<GroupCallOverlayProps> = ({
  roomName,
  userName,
  onClose,
}) => {
  //Jitsi URL with room name and user name
  const jitsiUrl = `https://meet.ffmuc.net/${roomName}?config.startWithAudioMuted=true
&config.startWithVideoMuted=false
&config.prejoinConfig.enabled=false
&config.requireDisplayName=false
&config.disableModeratorIndicator=true
&config.toolbarButtons=["microphone","camera","desktop","fullscreen","hangup","chat","tileview"]
&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true
&interfaceConfig.SHOW_JITSI_WATERMARK=false
&interfaceConfig.SHOW_BRAND_WATERMARK=false
&userInfo.displayName="${encodeURIComponent(userName)}"`;

  return (
    <div className="fixed inset-0 bg-black z-[50] flex flex-col">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl transition"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Jitsi Group Call (Full Screen) */}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full border-0"
        title="Group Video Call"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
      />
    </div>
  );
};

export default GroupCallOverlay;
