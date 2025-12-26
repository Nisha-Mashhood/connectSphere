import { useCallback, useEffect, useState } from "react";
import { socketService } from "../../../../Service/SocketService";
import { Contact } from "../../../../Interface/User/Icontact";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { clearActiveGroupCall, setActiveGroupCall, setIncomingGroupCall } from "../../../../redux/Slice/callSlice";
import { RootState } from "../../../../redux/store";

interface UseGroupCallParams {
  currentUserId: string;
  selectedContact: Contact | null;
}

export const useGroupCall = ({ currentUserId, selectedContact }: UseGroupCallParams) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const activeGroupCall = useSelector((state: RootState) => state.call.activeGroupCall);
  const [isGroupCallActive, setIsGroupCallActive] = useState(false);
  const dispatch = useDispatch();

  // Start call
  const startGroupCall = useCallback(() => {
    if (!selectedContact || selectedContact.type !== "group") return;
    const groupId = selectedContact.groupId;
    const roomName = `group-${groupId}`;
    socketService.emit("groupCallStarted", {
      groupId,
      starterId: currentUserId,
      callType: "video",
      roomName,
      starterName: currentUser?.name || "You",
    });
    socketService.emit("groupCallJoin", {
      groupId,
      userId: currentUserId,
    });
    dispatch(setActiveGroupCall({ groupId, roomName }));
    setIsGroupCallActive(true);
    toast.success("Group video call started!");
  }, [currentUserId, selectedContact, currentUser?.name, dispatch]);

  // End call
  const endGroupCall = useCallback(() => {
    setIsGroupCallActive(false);
    socketService.emit("groupCallEnded", {
      groupId: selectedContact?.groupId,
      callType: "video"
    });
    dispatch(clearActiveGroupCall());
  }, [selectedContact, dispatch]);

  useEffect(() => {
    if (activeGroupCall && activeGroupCall.groupId === selectedContact?.groupId) {
      setIsGroupCallActive(true);
    }
  }, [activeGroupCall, selectedContact]);

  // Listen for when someone starts a call in current group
  useEffect(() => {
    if (!selectedContact || selectedContact.type !== "group") return;

    const handleGroupCallStarted = (data: {
        groupId: string;
        starterId: string;
        starterName?: string;
    }) => {
        if (data.groupId === selectedContact.groupId && data.starterId !== currentUserId) {
        dispatch(setIncomingGroupCall({
            groupId: data.groupId,
            starterId: data.starterId,
            starterName: data.starterName || "Someone",
            roomName: `group-${data.groupId}`,
        }));
        }
    };
    const handleGroupJoined = (data: { userId: string; groupId: string }) => {
      if (selectedContact?.groupId === data.groupId) {
        console.log("User joined group call:", data.userId);
        setIsGroupCallActive(true);
      }
    };

    socketService.onGroupCallStarted(handleGroupCallStarted);
    socketService.onGroupCallJoined(handleGroupJoined);

    return () => {
        socketService.offGroupCallStarted(handleGroupCallStarted);
        socketService.offGroupCallJoined(handleGroupJoined);
    };
    }, [selectedContact, currentUserId, dispatch]);

  // Optional: listen for call ended
  useEffect(() => {
    const handleGroupCallEnded = (data: { groupId: string }) => {
      if (data.groupId === selectedContact?.groupId) {
        setIsGroupCallActive(false);
        toast.success("Group call ended");
      }
    };

    socketService.onGroupCallEnded(handleGroupCallEnded);

    return () => {
      socketService.offGroupCallEnded(handleGroupCallEnded);
    };
  }, [selectedContact]);

  return {
    isGroupCallActive,
    startGroupCall,
    endGroupCall,
  };
};