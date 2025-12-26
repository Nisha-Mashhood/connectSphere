import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIncomingGroupCall } from "../../../../redux/Slice/callSlice";
import { socketService } from "../../../../Service/SocketService";
import { RootState } from "../../../../redux/store";

const GlobalGroupCallListener: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    const handleGroupCallStarted = (data: {
      groupId: string;
      starterId: string;
      callType: string;
      roomName: string;
      starterName?: string;
    }) => {
      if (data.starterId !== currentUser?.id) {
        console.log("Incoming group call:", data);
        dispatch(setIncomingGroupCall({
          groupId: data.groupId,
          starterId: data.starterId,
          starterName: data.starterName || "Someone",
          roomName: data.roomName,
        }));
      }
    };
    socketService.onGroupCallStarted(handleGroupCallStarted);
    return () => {
      socketService.offGroupCallStarted(handleGroupCallStarted);
    };
  }, [dispatch, currentUser?.id]);

  return null;
};
export default GlobalGroupCallListener;