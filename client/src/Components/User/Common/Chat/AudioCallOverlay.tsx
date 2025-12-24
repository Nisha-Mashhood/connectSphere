import React from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

interface AudioCallOverlayProps {
  isAudioMuted: boolean;
  toggleAudio: () => void;
  endCall: () => void;
  remoteName: string;
}

const AudioCallOverlay: React.FC<AudioCallOverlayProps> = ({
  isAudioMuted,
  toggleAudio,
  endCall,
  remoteName,
}) => {
  return (
    <div className="fixed inset-0 bg-black z-[50] flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {remoteName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-white text-3xl font-semibold mb-2">
          {remoteName}
        </h2>
        <p className="text-white/70 text-lg mb-12">Audio Call</p>

        <div className="flex justify-center gap-8">
          <Tooltip content={isAudioMuted ? "Unmute" : "Mute"}>
            <Button
              isIconOnly
              size="lg"
              color={isAudioMuted ? "danger" : "default"}
              className="bg-white/20 backdrop-blur"
              onPress={toggleAudio}
            >
              {isAudioMuted ? <FaMicrophoneSlash size={28} /> : <FaMicrophone size={28} />}
            </Button>
          </Tooltip>

          <Button size="lg" color="danger" className="px-12" onPress={endCall}>
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioCallOverlay;