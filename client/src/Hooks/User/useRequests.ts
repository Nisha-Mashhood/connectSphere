import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTheRequestByUser,
  getAllRequest,
  acceptTheRequest,
  rejectTheRequest,
  deleteMentorRequest,
} from "../../Service/collaboration.Service";
import { AppDispatch, RootState } from "../../redux/store";
import toast from "react-hot-toast";
import { RequestData } from "../../redux/types";
import { refreshCollaborations } from "../../redux/Slice/profileSlice";
import { findSameSlotSentRequests, hasUserCollabConflict } from "../../pages/User/Explore/helpers/SlotSelection";

export const useRequests = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails, collabDetails } = useSelector((state: RootState) => state.profile);
  const [sentRequests, setSentRequests] = useState<RequestData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const [acceptConflictModalOpen, setAcceptConflictModalOpen] = useState<boolean>(false);
  const [acceptConflictingRequests, setAcceptConflictingRequests] = useState< RequestData[]>([]);
  const [pendingAcceptRequestId, setPendingAcceptRequestId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch sent requests
      const sentData = await getTheRequestByUser(currentUser.id);
      setSentRequests(sentData.requests || []);

      // Fetch received requests for mentors
      if (currentUser.role === "mentor" && mentorDetails) {
        const receivedData = await getAllRequest(mentorDetails.id);
        setReceivedRequests(receivedData.requests || []);
      } else {
        setReceivedRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error.message);
      toast.error("Failed to load requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, mentorDetails]);

  const handleAccept = async (requestId: string) => {
  try {
    const requestToAccept = receivedRequests.find(
      (r) => r.id === requestId
    );

    // If we can't find it or slot is missing, just accept
    if (!requestToAccept || !requestToAccept.selectedSlot) {
      await acceptTheRequest(requestId);
      toast.success("Request accepted successfully!");
      await fetchRequests();
      await dispatch(
        refreshCollaborations({
          userId: currentUser.id,
          role: currentUser.role,
          mentorId: mentorDetails?.id,
        })
      );
      return;
    }

    const slotLabel = `${requestToAccept.selectedSlot.day} - ${requestToAccept.selectedSlot.timeSlots}`;

    // Check against existing collaborations (mentor's schedule)
    const collabConflict = hasUserCollabConflict(slotLabel, collabDetails);

    if (collabConflict) {
      toast.error(
        "You already have a confirmed session at this time. Please choose a different slot or cancel the other collaboration."
      );
      return;
    }

    //Check mentor's own SENT requests with same slot
    const sameSlotSentRequests = findSameSlotSentRequests(
      slotLabel,
      sentRequests
    );

    if (sameSlotSentRequests.length > 0) {
      // Show modal: mentor has outgoing requests at the same time
      setPendingAcceptRequestId(requestId);
      setAcceptConflictingRequests(sameSlotSentRequests);
      setAcceptConflictModalOpen(true);
      return;
    }

    //No conflicts → accept directly
    await acceptTheRequest(requestId);
    toast.success("Request accepted successfully!");
    await fetchRequests();
    await dispatch(
      refreshCollaborations({
        userId: currentUser.id,
        role: currentUser.role,
        mentorId: mentorDetails?.id,
      })
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error accepting request:", err.message);
    toast.error(`Error: ${error}`);
  }
};

const confirmAcceptWithConflict = useCallback(async (): Promise<void> => {
  if (!pendingAcceptRequestId) return;

  try {
    // Delete mentor's own SENT requests that clash with this slot
    if (acceptConflictingRequests.length > 0) {
      await Promise.all(
        acceptConflictingRequests.map((r) => deleteMentorRequest(r.id))
      );
    }
    //accept the pending request
    await acceptTheRequest(pendingAcceptRequestId);
    toast.success("Request accepted successfully!");

    await fetchRequests();
    await dispatch(
      refreshCollaborations({
        userId: currentUser.id,
        role: currentUser.role,
        mentorId: mentorDetails?.id,
      })
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error accepting request with conflict:", err.message);
    toast.error("Failed to accept request. Please try again.");
  } finally {
    setAcceptConflictModalOpen(false);
    setPendingAcceptRequestId(null);
    setAcceptConflictingRequests([]);
  }
}, [
  pendingAcceptRequestId,
  acceptConflictingRequests,
  fetchRequests,
  dispatch,
  currentUser.id,
  currentUser.role,
  mentorDetails?.id,
]);

  const handleReject = async (requestId: string) => {
    try {
      await rejectTheRequest(requestId);
      toast.success("Request rejected successfully!");
      fetchRequests();
      dispatch(
        refreshCollaborations({
          userId: currentUser.id,
          role: currentUser.role,
          mentorId: mentorDetails?.id,
        })
  );
    } catch (error) {
      console.error("Error rejecting request:", error.message);
      toast.error("Failed to reject request. Please try again.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    sentRequests,
    receivedRequests,
    isLoading,
    handleAccept,
    handleReject,
    fetchRequests,
    acceptConflictModalOpen,
    setAcceptConflictModalOpen,
    acceptConflictingRequests,
    confirmAcceptWithConflict,
  };
};