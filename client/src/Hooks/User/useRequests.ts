import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTheRequestByUser,
  getAllRequest,
  acceptTheRequest,
  rejectTheRequest,
} from "../../Service/collaboration.Service";
import { AppDispatch, RootState } from "../../redux/store";
import toast from "react-hot-toast";
import { RequestData } from "../../redux/types";
import { refreshCollaborations } from "../../redux/Slice/profileSlice";

export const useRequests = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails } = useSelector((state: RootState) => state.profile);
  const [sentRequests, setSentRequests] = useState<RequestData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

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
      await acceptTheRequest(requestId);
      toast.success("Request accepted successfully!");
      fetchRequests();
      dispatch(
        refreshCollaborations({
          userId: currentUser.id,
          role: currentUser.role,
          mentorId: mentorDetails?.id,
        })
  );
    } catch (error) {
      console.error("Error accepting request:", error.message);
      toast.error("Failed to accept request. Please try again.");
    }
  };

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
  };
};