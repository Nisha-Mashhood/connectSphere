import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorById } from "../../Service/Mentor.Service";
import { fetchUserDetails } from "../../Service/User.Service";
import {
  getCollabDataforMentor,
  getCollabDataforUser,
  getLockedMentorSlot,
  getTheRequestByUser,
} from "../../Service/collaboration.Service";
import { getFeedbackForProfile } from "../../Service/Feedback.service";
import { fetchUserConnections } from "../../redux/Slice/profileSlice";
import { AppDispatch, RootState } from "../../redux/store";
import toast from "react-hot-toast";
import {
  CollabData,
  Feedback,
  LockedSlot,
  Mentor,
  RequestData,
  User,
} from "../../redux/types";

interface CollabResponse {
  collabData: CollabData[];
}

export const useProfileData = () => {
  const { Id } = useParams<{ Id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { userConnections } = useSelector((state: RootState) => state.profile);

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMentor, setIsMentor] = useState<boolean>(false);
  const [collabData, setCollabData] = useState<CollabData[]>([]);
  const [hasExistingCollaboration, setHasExistingCollaboration] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RequestData | null>(null);
  const [isCurrentUserMentor, setIsCurrentUserMentor] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [lockedSlots, setLockedSlots] = useState<LockedSlot[]>([]);

  const checkIfUserIsMentor = async (id: string) => {
    try {
      const data = await fetchMentorById(id);
      return !!(data && data.mentor);
    } catch (error) {
      if (error.message !== "Mentor not found") console.error(error);
      return false;
    }
  };

  // Memoize these functions
  const fetchExistingRequest = useCallback(async () => {
    if (!currentUser?.id || !Id) return;
    try {
      const res = await getTheRequestByUser(currentUser.id);
      const req = res.requests.find((r: RequestData) => r.mentorId === Id);
      setExistingRequest(req || null);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.id, Id]);

  const checkExistingCollaboration = useCallback((res: CollabResponse): boolean => {
    if (!res?.collabData?.length || !currentUser) return false;
    return res.collabData.some((c) => {
      if (isMentor) {
        return isCurrentUserMentor
          ? c.mentorId === mentor?.id
          : c.userId === currentUser.id;
      }
      return isCurrentUserMentor
        ? c.mentorId === currentUser.id
        : c.userId === currentUser.id;
    });
  }, [currentUser, isMentor, isCurrentUserMentor, mentor?.id]);

  const fetchFeedback = useCallback(
    async (type: "mentor" | "user") => {
      if (!Id) return;
      try {
        const data = await getFeedbackForProfile(Id, type);
        setFeedbacks(data.feedbacks || []);
      } catch (error) {
        console.log(error);
        toast.error(`Failed to load ${type} feedback`);
        setFeedbacks([]);
      }
    },
    [Id]
  );

  const fetchLockedSlots = useCallback(
    async (mentorId: string) => {
      try {
        const res = await getLockedMentorSlot(mentorId);
        setLockedSlots(res.lockedSlots || []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load locked slots");
        setLockedSlots([]);
      }
    },
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id || !Id) {
        toast.error("Invalid user or profile ID");
        return;
      }

      const isCurrMentor = await checkIfUserIsMentor(currentUser.id);
      setIsCurrentUserMentor(isCurrMentor);

      const isProfileMentor = await checkIfUserIsMentor(Id);
      setIsMentor(isProfileMentor);

      if (isProfileMentor) {
        const mData = await fetchMentorById(Id);
        if (mData?.mentor) {
          setMentor(mData.mentor);
          await Promise.all([
            getCollabDataforMentor(Id).then((r: CollabResponse) => {
              setCollabData(r.collabData);
              setHasExistingCollaboration(checkExistingCollaboration(r));
            }),
            fetchLockedSlots(Id),
            fetchFeedback("mentor"),
          ]);
        } else {
          toast.error("Failed to load mentor data");
        }
      } else {
        const uData = await fetchUserDetails(Id);
        if (uData?.user) {
          setUser(uData.user);
          await Promise.all([
            getCollabDataforUser(Id).then((r: CollabResponse) => {
              setCollabData(r.collabData);
              setHasExistingCollaboration(checkExistingCollaboration(r));
            }),
            fetchFeedback("user"),
          ]);
        } else {
          toast.error("Failed to load user data");
        }
      }

      await fetchExistingRequest();
      dispatch(fetchUserConnections(currentUser.id));
    };

    load();
  }, [
    Id,
    currentUser?.id,
    dispatch,
    checkExistingCollaboration,
    fetchExistingRequest,
    fetchFeedback,
    fetchLockedSlots,
  ]);

  const isSlotLocked = useCallback((day: string, timeSlot: string) => {
    const start = timeSlot.match(/^(\d{1,2}:\d{2}\s[AP]M)/)?.[1] || timeSlot;
    const nDay = day.trim().toLowerCase();
    const nStart = start.trim().toLowerCase();

    return lockedSlots.some((l) => {
      const lDay = l.day.trim().toLowerCase();
      return (
        lDay === nDay &&
        l.timeSlots.some((t: string) => t.trim().toLowerCase() === nStart)
      );
    });
  }, [lockedSlots]);

  return {
    mentor,
    user,
    isMentor,
    collabData,
    hasExistingCollaboration,
    existingRequest,
    isCurrentUserMentor,
    feedbacks,
    lockedSlots,
    isSlotLocked,
    userConnections,
    currentUser,
    navigate,
  };
};