import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  approveMentor as approveMentorService,
  cancelMentorship as cancelMentorshipService,
  rejectMentor,
} from "../../Service/Mentor.Service";
import {
  getFeedbackByMentorId,
  toggleFeedbackVisibility,
} from "../../Service/Feedback.service";
import { Feedback, Mentor } from "../../redux/types";

export const useMentorDetails = (mentor: Mentor, onClose: () => void, onMentorUpdate: (m: Mentor) => void) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch feedback
  const fetchFeedback = useCallback(async () => {
    try {
      setLoadingFeedback(true);
      const data = await getFeedbackByMentorId(mentor.id);
      setFeedbacks(Array.isArray(data.feedbacks) ? data.feedbacks : []);
    } catch (error) {
        console.log(error);
      toast.error("Failed to fetch feedback.");
      setFeedbacks([]);
    } finally {
      setLoadingFeedback(false);
    }
  }, [mentor.id]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Approve mentor
  const approveMentor = async () => {
    try {
      await approveMentorService(mentor.id);
      onMentorUpdate({ ...mentor, isApproved: "Completed" });
      toast.success("Mentor approved successfully.");
      onClose();
    } catch (error) {
        console.log(error);
      toast.error("Failed to approve mentor.");
    }
  };

  // Cancel mentorship
  const cancelMentorship = async () => {
    try {
      await cancelMentorshipService(mentor.id);
      onMentorUpdate({ ...mentor, isApproved: "Pending" });
      toast.success("Mentorship canceled successfully.");
      onClose();
    } catch {
      toast.error("Failed to cancel mentorship.");
    }
  };

  // Reject mentor
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      await rejectMentor(mentor.id, rejectionReason);
      onMentorUpdate({ ...mentor, isApproved: "Rejected" });
      toast.success("Mentor rejected successfully.");
      setRejectionModal(false);
      onClose();
    } catch {
      toast.error("Failed to reject mentor.");
    }
  };

  // Toggle feedback visibility
  const handleToggleVisibility = async (feedbackId: string) => {
    try {
      const updated = await toggleFeedbackVisibility(feedbackId);
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.feedbackId === feedbackId ? { ...f, isHidden: updated.isHidden } : f
        )
      );
      toast.success(`Feedback ${updated.isHidden ? "hidden" : "visible"}`);
    } catch {
      toast.error("Failed to toggle feedback visibility.");
    }
  };

  return {
    feedbacks,
    loadingFeedback,
    approveMentor,
    cancelMentorship,
    rejectionModal,
    setRejectionModal,
    rejectionReason,
    setRejectionReason,
    submitRejection,
    selectedCertificate,
    setSelectedCertificate,
    handleToggleVisibility,
  };
};