import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { 
  clearIncomingCall, 
  clearIncomingGroupCall, 
  setActiveGroupCall, 
  setIncomingCall, 
} from "../../../redux/Slice/callSlice";
import { Button } from "@nextui-org/react";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../../Service/SocketService";

const IncomingCallBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const incomingCall = useSelector((state: RootState) => state.call.incomingCall);
  const incomingGroupCall = useSelector((state: RootState) => state.call.incomingGroupCall);
  const { currentUser } = useSelector((state: RootState) => state.user);

  // No call → hide bar
  if (!incomingCall && !incomingGroupCall) return null;

  const isGroupCall = !!incomingGroupCall;

  const senderName = isGroupCall 
    ? incomingGroupCall?.starterName || "Group Call"
    : incomingCall?.senderName || "Someone";

  const callTypeText = isGroupCall 
    ? "Group Video" 
    : incomingCall?.callType === "video" ? "Video" : "Audio";

  const handleAccept = () => {
    if (isGroupCall && incomingGroupCall) {
        socketService.emit("groupCallJoin", {
        groupId: incomingGroupCall.groupId,
        userId: currentUser.id,
      });
      navigate(`/chat/group/${incomingGroupCall.groupId}`);
      dispatch(setActiveGroupCall({
        groupId: incomingGroupCall.groupId,
        roomName: incomingGroupCall.roomName,
      }));
      dispatch(clearIncomingGroupCall());
    } else if (incomingCall || incomingCall?.offerData) {
      const routeType = incomingCall.contactType === "user-mentor" ? "user-mentor" : "user-user";
      dispatch(setIncomingCall({
        ...incomingCall,
        shouldAutoAnswer: true,
      }));
      navigate(`/chat/${routeType}/${incomingCall.senderId}`);
    }
  };

  const handleDecline = () => {
    if (isGroupCall) {
      dispatch(clearIncomingGroupCall());
    } else if (incomingCall?.offerData) {
      socketService.emitCallEnded({
        userId: incomingCall.offerData.targetId,
        targetId: incomingCall.offerData.userId,
        type: incomingCall.contactType,
        chatKey: incomingCall.offerData.chatKey,
        callType: incomingCall.callType,
      });
      dispatch(clearIncomingCall());
    }
  };

  return (
    <div className="fixed top-16 left-4 right-4 md:left-12 md:right-12 bg-gradient-to-r from-emerald-700 to-green-800 text-white z-50 shadow-xl rounded-xl overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <FaPhone className="text-xl" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">
              Incoming {callTypeText} Call
            </p>
            <p className="text-xs opacity-90">{senderName}</p>
          </div>
        </div>

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