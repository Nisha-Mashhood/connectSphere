import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socketService } from "../../../Service/SocketService";
import { setIncomingCall } from "../../../redux/Slice/callSlice";
import { IncomingCallData } from "../../../Hooks/User/Chat/OneToOneCall/useChatCall";

const GlobalCallListener: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGlobalOffer = (data: IncomingCallData) => {
      console.log("GLOBAL Incoming call detected:", data);
      dispatch(setIncomingCall({
        senderId: data.userId,
        senderName: data.senderName || "Someone",
        callType: data.callType,
        contactType: data.type as 'user-user' | 'user-mentor',
        offerData: data,
      }));
      console.log("RING RING! Incoming call from", data.senderName || "Someone");
    };
    socketService.onOffer(handleGlobalOffer);
    return () => {
      socketService.offOffer(handleGlobalOffer);
    };
  }, [dispatch]);
  return null;
};

export default GlobalCallListener;