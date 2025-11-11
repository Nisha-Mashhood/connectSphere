import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  acceptTheRequest,
  cancelAndRefundCollab,
  fetchCollabDetails,
  fetchCollabRequsetDetails,
  rejectTheRequest,
} from "../../Service/collaboration.Service";
import toast from "react-hot-toast";
import { CollabData, RequestData } from "../../redux/types";

type Details = CollabData | RequestData;

export const useCollaborationDetails = () => {
  const { collabId, requestId } = useParams<{
    collabId?: string;
    requestId?: string;
  }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundConfirmDialog, setShowRefundConfirmDialog] = useState(false);
  const [reason, setReason] = useState("");

  const fetchDetails = useCallback(async () => {
    try {
      let data: Details;
      if (collabId) {
        data = await fetchCollabDetails(collabId);
        console.log("Collab Details : ",data);
      } else if (requestId) {
        data = await fetchCollabRequsetDetails(requestId);
        console.log("Req Details : ",data);
      } else {
        throw new Error("No ID provided");
      }
      setDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  }, [collabId, requestId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAccept = async () => {
    if (!requestId) return;
    try {
      const ok = await acceptTheRequest(requestId);
      if (ok) toast.success("Request accepted");
      fetchDetails();
    } catch (e) {
      toast.error(e.message ?? "Accept failed");
    }
  };

  const handleReject = async () => {
    if (!requestId) return;
    try {
      const ok = await rejectTheRequest(requestId);
      if (ok) toast.success("Request rejected");
      fetchDetails();
    } catch (e) {
      toast.error(e.message ?? "Reject failed");
    }
  };

  const handleConfirmRefund = async () => {
    if (!collabId || !reason.trim()) return;
    try {
      await cancelAndRefundCollab(collabId, reason, (details as CollabData).price / 2);
      toast.success("Collaboration cancelled – 50% refunded");
      navigate("/admin/userMentorManagemnt");
    } catch (e) {
        console.log(e)
      toast.error("Refund failed");
    } finally {
      setShowRefundConfirmDialog(false);
      setShowCancelDialog(false);
      setReason("");
    }
  };

  const openCancelFlow = () => setShowCancelDialog(true);
  const closeCancelFlow = () => {
    setShowCancelDialog(false);
    setReason("");
  };
  const openRefundConfirm = () => {
    if (!reason.trim()) {
      toast.error("Reason required");
      return;
    }
    setShowCancelDialog(false);
    setShowRefundConfirmDialog(true);
  };

  return {
    details,
    loading,
    isCollab: !!collabId,
    showCancelDialog,
    showRefundConfirmDialog,
    setShowRefundConfirmDialog,
    reason,
    setReason,
    openCancelFlow,
    closeCancelFlow,
    openRefundConfirm,
    handleConfirmRefund,
    handleAccept,
    handleReject,
    refetch: fetchDetails,
    navigateBack: () => navigate(-1),
  };
};