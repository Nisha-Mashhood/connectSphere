import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store"; // Adjust path if needed
import { clearIncomingCall } from "../../../redux/Slice/callSlice"; // Adjust path
import { Button } from "@nextui-org/react";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const IncomingCallBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const incomingCall = useSelector((state: RootState) => state.call.incomingCall);

  if (!incomingCall) return null; // Hide if no call

  const handleAccept = () => {
    // For now, just clear the bar — real accept will come later
    dispatch(clearIncomingCall());
    const routeType = incomingCall.contactType === "user-mentor" ? "user-mentor" : "user-user";

    // Navigate to the chat with the caller (adjust route as needed)
    navigate(`/chat/${routeType}/${incomingCall.senderId}`);
  };

  const handleDecline = () => {
    dispatch(clearIncomingCall());
    // Later: send decline signal via socket
  };

  const callTypeText = incomingCall.callType === "video" ? "Video" : "Audio";

  return (
    <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white z-50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="animate-pulse">
            <FaPhone className="text-2xl" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              Incoming {callTypeText} Call
            </p>
            <p className="text-sm opacity-90">from {incomingCall.senderName}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            color="danger"
            variant="solid"
            size="lg"
            onPress={handleDecline}
            startContent={<FaPhoneSlash />}
          >
            Decline
          </Button>
          <Button
            color="success"
            variant="solid"
            size="lg"
            onPress={handleAccept}
            startContent={<FaPhone className="rotate-12" />}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallBar;