import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchCollabDetails,
  fetchMentorDetails,
} from "../../redux/Slice/profileSlice";
import { getFeedbackByCollaborationId } from "../../Service/Feedback.service";
import { CollabData, Feedback, Mentor } from "../../redux/types";

export const useActiveCollaborations = (
  handleProfileClick: (id: string) => void
) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);

  const [mentorDetails, setMentorDetails] = useState<Mentor>();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<CollabData | null>(null);
  const [feedbackData, setFeedbackData] = useState<Record<string, Feedback>>(
    {}
  );
  const [activeTab, setActiveTab] = useState("asMentor");
  const [currentDate, setCurrentDate] = useState(new Date());

  /*Clock – keep currentDate fresh every minute                      */

  useEffect(() => {
    const id = setInterval(() => setCurrentDate(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /*Fetch collaborations (user + mentor)                             */
  const fetchCollaborations = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      if (currentUser.role === "mentor") {
        const mentor = await dispatch(
          fetchMentorDetails(currentUser.id)
        ).unwrap();
        setMentorDetails(mentor);

        console.log("CURRENT USER ID (mentor):", currentUser.id);
        console.log("MENTOR PROFILE ID (_id):", mentor?.id);

        if (mentor?.id) {
          await dispatch(
            fetchCollabDetails({
              userId: currentUser.id,
              role: "mentor",
              mentorId: mentor.id,
            })
          );
        }
      } else {
        console.log("CURRENT USER ID (user):", currentUser.id);
        await dispatch(
          fetchCollabDetails({ userId: currentUser.id, role: "user" })
        );
      }
    } catch (e) {
      console.error("fetchCollaborations error:", e);
    }
  }, [currentUser, dispatch]);

  /*Fetch feedback for *completed* collabs (mentor only)            */

  const fetchFeedbackForCollabs = useCallback(async (collabs: CollabData[]) => {
    const promises = collabs
      .filter((c) => c.feedbackGiven)
      .map(async (c) => {
        try {
          const fb = await getFeedbackByCollaborationId(c.id);
          return { [c.id]: fb[0] ?? null };
        } catch {
          return { [c.id]: null };
        }
      });

    const results = await Promise.all(promises);
    const map = results.reduce((acc, cur) => ({ ...acc, ...cur }), {});
    setFeedbackData(map);
  }, []);

  /*Split collabs into ONGOING / COMPLETED                           */

  const ongoingCollabs = useMemo(() => {
    if (!collabDetails?.data) return [];

    return collabDetails.data.filter((c) => {
      const end = new Date(c.endDate);
      return !c.isCompleted && end > currentDate;
    });
  }, [collabDetails?.data, currentDate]);

  const completedCollabs = useMemo(() => {
    if (!collabDetails?.data) return [];

    return collabDetails.data.filter((c) => {
      const end = new Date(c.endDate);
      return c.isCompleted && end <= currentDate;
    });
  }, [collabDetails?.data, currentDate]);

  /* Role-based buckets                                               */

  const mentorOngoingCollabs = useMemo(() => {
    if (currentUser.role !== "mentor") return [];
    return ongoingCollabs.filter((c) => c.mentor?.userId === currentUser.id);
  }, [currentUser.role, ongoingCollabs, currentUser.id]);

  const mentorCompletedCollabs = useMemo(() => {
    if (currentUser.role !== "mentor") return [];
    return completedCollabs.filter((c) => c.mentor?.userId === currentUser.id);
  }, [currentUser.role, completedCollabs, currentUser.id]);

  const userOngoingCollabs = useMemo(() => {
    if (currentUser.role !== "user") return [];
    return ongoingCollabs.filter((c) => c.userId === currentUser.id);
  }, [currentUser.role, ongoingCollabs, currentUser.id]);

  const userCompletedCollabs = useMemo(() => {
    if (currentUser.role !== "user") return [];
    return completedCollabs.filter((c) => c.userId === currentUser.id);
  }, [currentUser.role, completedCollabs, currentUser.id]);

  console.log("Fetched collaborations: ", collabDetails);
  console.log(
    "mentorOngoingCollabs:",
    mentorOngoingCollabs.map((c) => c.collaborationId)
  );
  console.log(
    "mentorCompletedCollabs:",
    mentorCompletedCollabs.map((c) => c.collaborationId)
  );
  console.log(
    "userOngoingCollabs:",
    userOngoingCollabs.map((c) => c.collaborationId)
  );
  console.log(
    "userCompletedCollabs:",
    userCompletedCollabs.map((c) => c.collaborationId)
  );

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  useEffect(() => {
    if (currentUser?.role === "mentor" && collabDetails?.data) {
      fetchFeedbackForCollabs(completedCollabs);
    }
  }, [
    collabDetails?.data,
    currentUser,
    fetchFeedbackForCollabs,
    completedCollabs,
  ]);

  const handleCollabClick = (id: string) => navigate(`/collaboration/${id}`);

  const handleFeedbackClick = (e: React.MouseEvent, collab: CollabData) => {
    e.stopPropagation();
    setSelectedCollab(collab);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackComplete = () => fetchCollaborations();

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedCollab(null);
  };

  return {
    currentUser,
    collabDetails,
    mentorDetails,
    feedbackModalOpen,
    selectedCollab,
    feedbackData,
    activeTab,
    setActiveTab,
    mentorOngoingCollabs,
    mentorCompletedCollabs,
    userOngoingCollabs,
    userCompletedCollabs,
    handleCollabClick,
    handleFeedbackClick,
    handleFeedbackComplete,
    closeFeedbackModal,
    handleProfileClick,
  };
};
