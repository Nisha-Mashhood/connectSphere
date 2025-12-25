import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { clearIncomingCall, setIncomingCall } from "../../../redux/Slice/callSlice";
import { Button } from "@nextui-org/react";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../../Service/SocketService";

const IncomingCallBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const incomingCall = useSelector((state: RootState) => state.call.incomingCall);

  if (!incomingCall || !incomingCall.offerData) return null;

  const handleAccept = () => {
    const routeType =
      incomingCall.contactType === "user-mentor" ? "user-mentor" : "user-user";
      dispatch(setIncomingCall({
            ...incomingCall,
            shouldAutoAnswer: true,  // ← Mark 
        }));
    navigate(`/chat/${routeType}/${incomingCall.senderId}`);
  };

  const handleDecline = () => {
    // Properly decline the call via socket
    if (incomingCall.offerData) {
      socketService.emitCallEnded({
        userId: incomingCall.offerData.targetId,
        targetId: incomingCall.offerData.userId,
        type: incomingCall.contactType,
        chatKey: incomingCall.offerData.chatKey,
        callType: incomingCall.callType,
      });
    }

    // Clear the bar
    dispatch(clearIncomingCall());
  };

  const callTypeText = incomingCall.callType === "video" ? "Video" : "Audio";

  return (
    <div className="fixed top-16 left-4 right-4 md:left-12 md:right-12 bg-gradient-to-r from-emerald-700 to-green-800 text-white z-50 shadow-xl rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Call Info */}
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <FaPhone className="text-xl" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">
              Incoming {callTypeText} Call
            </p>
            <p className="text-xs opacity-90">{incomingCall.senderName}</p>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          <Button
            color="danger"
            variant="flat"
            size="sm"
            onPress={handleDecline}
            className="min-w-20"
            startContent={<FaPhoneSlash size={16} />}
          >
            Decline
          </Button>

          <Button
            color="success"
            variant="solid"
            size="sm"
            onPress={handleAccept}
            className="min-w-20"
            startContent={<FaPhone size={16} className="rotate-12" />}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallBar;