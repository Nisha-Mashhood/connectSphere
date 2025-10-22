import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppDispatch, RootState } from "../../../../redux/store";
import { calculateTimeLeft } from "../../../../lib/helperforprofile";
import { FaClock, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../../../Forms/FeedbackModal";
import {
  fetchCollabDetails,
  fetchMentorDetails,
} from "../../../../redux/Slice/profileSlice";
import { Tab, Tabs, Tooltip } from "@nextui-org/react";
import { getFeedbackByCollaborationId } from "../../../../Service/Feedback.service";

const ActiveCollaborations = ({ handleProfileClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);
  const [mentorDetails, setMentorDetails] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [activeTab, setActiveTab] = useState("asMentor");
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date()); 

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); 

    return () => clearInterval(interval); 
  }, []);

  // Fetch collaboration data and feedback for mentor view
  const fetchCollaborations = useCallback(async () => {
    if (currentUser && currentUser.id) {
      try {
        if (currentUser.role === "mentor") {
          const mentorDetails = await dispatch(
            fetchMentorDetails(currentUser.id)
          ).unwrap();
          setMentorDetails(mentorDetails);
          if (mentorDetails?.id) {
            await dispatch(
              fetchCollabDetails({ userId: mentorDetails.id, role: "mentor" })
            );
          } else {
            console.error("Unable to retrieve mentor details");
          }
        } else {
          await dispatch(
            fetchCollabDetails({ userId: currentUser.id, role: "user" })
          );
        }
      } catch (error) {
        console.error("Error fetching collaborations:", error);
      }
    }
  }, [currentUser, dispatch]);
  console.log(`mentorDetails of this user is : ${mentorDetails}`);

  // Fetch feedback for completed collaborations (mentor view)
  const fetchFeedbackForCollabs = useCallback(async (collabs) => {
    const feedbackPromises = collabs
      .filter((collab) => collab.feedbackGiven)
      .map(async (collab) => {
        try {
          const feedback = await getFeedbackByCollaborationId(collab.id);
          console.log("FeedBack Accessed :", feedback);
          return { [collab.id]: feedback[0] || null };
        } catch (error) {
          console.error(
            `Error fetching feedback for collab ${collab.id}:`,
            error
          );
          return { [collab.id]: null };
        }
      });
    const feedbackResults = await Promise.all(feedbackPromises);
    const feedbackMap = feedbackResults.reduce(
      (acc, curr) => ({ ...acc, ...curr }),
      {}
    );
    setFeedbackData(feedbackMap);
  }, []);

  const ongoingCollabs = useMemo(() => {
    return (
      collabDetails?.data?.filter(
      (collab) => new Date(collab.endDate) > currentDate && !collab.isCancelled
    ) || []
    );
  }, [collabDetails, currentDate]);
    

  const completedCollabs = useMemo(() => {
    return (
      collabDetails?.data?.filter(
        (collab) =>
          new Date(collab.endDate) <= currentDate || collab.isCancelled
      ) || []
    );
  }, [collabDetails, currentDate]);

  useEffect(() => {
    fetchCollaborations();
  }, [dispatch, currentUser, fetchCollaborations]);

  useEffect(() => {
    if (currentUser?.role === "mentor" && collabDetails?.data) {
      fetchFeedbackForCollabs(completedCollabs);
    }
  }, [collabDetails, currentUser, fetchFeedbackForCollabs, completedCollabs]);

  const handleCollabClick = (collabId) => {
    navigate(`/collaboration/${collabId}`);
  };

  const handleFeedbackClick = (e, collab) => {
    e.stopPropagation();
    setSelectedCollab(collab);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackComplete = () => {
    fetchCollaborations();
    console.log("Feedback completed");
  };

  // For mentors, split collaborations into "As Mentor" and "As User"
  const mentorOngoingCollabs =
    currentUser.role === "mentor"
      ? ongoingCollabs.filter(
          (collab) => collab.mentor?.userId === currentUser.id
        )
      : [];
  const mentorCompletedCollabs =
    currentUser.role === "mentor"
      ? completedCollabs.filter(
          (collab) => collab.mentor?.userId === currentUser.id
        )
      : [];
  const userOngoingCollabs =
    currentUser.role === "mentor"
      ? ongoingCollabs.filter(
          (collab) => collab.userId === currentUser.id
        )
      : ongoingCollabs;
  const userCompletedCollabs =
    currentUser.role === "mentor"
      ? completedCollabs.filter(
          (collab) => collab.userId === currentUser.id
        )
      : completedCollabs;

  console.log("Ongoing collaborations (Mentor):", mentorOngoingCollabs);
  console.log("Completed collaborations (Mentor):", mentorCompletedCollabs);
  console.log("Ongoing collaborations (User):", userOngoingCollabs);
  console.log("Completed collaborations (User):", userCompletedCollabs);

  const renderFeedbackTooltip = (collab) => {
    const feedback = feedbackData[collab.id];
    if (!feedback) return null;
    return (
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 max-w-md">
        <p className="font-semibold text-gray-900 dark:text-white">
          Feedback from {feedback.userId?.name}
        </p>
        <div className="flex items-center space-x-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-4 h-4 ${
                i < feedback.rating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          <strong>Communication:</strong> {feedback.communication}/5
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Expertise:</strong> {feedback.expertise}/5
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Punctuality:</strong> {feedback.punctuality}/5
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Comments:</strong> {feedback.comments}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Recommend:</strong> {feedback.wouldRecommend ? "Yes" : "No"}
        </p>
      </div>
    );
  };

  const renderCollaboration = (collab, isCompleted = false) => {
    const isUserRole =
      currentUser.role === "user" ||
      (currentUser.role === "mentor" && collab.userId === currentUser.id);
    const displayUser = isUserRole ? collab.mentor?.user : collab.user;
    return (
      <div
        key={collab.id}
        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
        onClick={() => handleCollabClick(collab.id)}
      >
        <div className="flex items-center space-x-4">
          <img
            src={displayUser?.profilePic}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <p
              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(
                  isUserRole ? collab.mentorId : collab.userId
                );
              }}
            >
              {displayUser?.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{collab.selectedSlot[0].day}</span>
              <span>•</span>
              <span>{collab.selectedSlot[0].timeSlots.join(", ")}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <FaClock className="mr-1" />
                <span>
                  {isCompleted
                    ? "Completed"
                    : calculateTimeLeft(collab.endDate)}
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                ₹{collab.price}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && currentUser.role === "user" ? (
              collab.feedbackGiven ? (
                <button
                  disabled
                  className="px-3 py-1 text-sm font-medium rounded-full bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                >
                  Feedback Provided
                </button>
              ) : (
                <button
                  onClick={(e) => handleFeedbackClick(e, collab)}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center"
                >
                  <FaStar className="mr-1" /> Give Feedback
                </button>
              )
            ) : isCompleted &&
              currentUser.role === "mentor" &&
              collab.feedbackGiven ? (
              <Tooltip content={renderFeedbackTooltip(collab)} placement="top">
                <button
                  disabled
                  className="px-3 py-1 text-sm font-medium rounded-full bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-default"
                >
                  Feedback Provided
                </button>
              </Tooltip>
            ) : isCompleted && currentUser.role === "mentor" ? (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                No Feedback
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
          </div>
        </div>
        {!isCompleted && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${
                    ((new Date().getTime() -
                      new Date(collab.startDate).getTime()) /
                      (new Date(collab.endDate).getTime() -
                        new Date(collab.startDate).getTime())) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMentorTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Ongoing Collaborations (As Mentor)
      </h2>
      <div className="space-y-4 mb-8">
        {mentorOngoingCollabs.map((collab) =>
          renderCollaboration(collab, false)
        )}
        {mentorOngoingCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No ongoing collaborations found
          </p>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Completed Collaborations (As Mentor)
      </h2>
      <div className="space-y-4">
        {mentorCompletedCollabs.map((collab) =>
          renderCollaboration(collab, true)
        )}
        {mentorCompletedCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No completed collaborations found
          </p>
        )}
      </div>
    </div>
  );

  const renderUserTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Ongoing Collaborations (As User)
      </h2>
      <div className="space-y-4 mb-8">
        {userOngoingCollabs.map((collab) => renderCollaboration(collab, false))}
        {userOngoingCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No ongoing collaborations found
          </p>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Completed Collaborations (As User)
      </h2>
      <div className="space-y-4">
        {userCompletedCollabs.map((collab) =>
          renderCollaboration(collab, true)
        )}
        {userCompletedCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No completed collaborations found
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {currentUser.role === "mentor" ? (
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(String(key))}
          aria-label="Collaboration roles"
          color="primary"
          variant="underlined"
        >
          <Tab key="asMentor" title="As Mentor">
            {renderMentorTab()}
          </Tab>
          <Tab key="asUser" title="As User">
            {renderUserTab()}
          </Tab>
        </Tabs>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Ongoing Collaborations
          </h2>
          <div className="space-y-4 mb-8">
            {userOngoingCollabs.map((collab) =>
              renderCollaboration(collab, false)
            )}
            {userOngoingCollabs.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No ongoing collaborations found
              </p>
            )}
          </div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Completed Collaborations
          </h2>
          <div className="space-y-4">
            {userCompletedCollabs.map((collab) =>
              renderCollaboration(collab, true)
            )}
            {userCompletedCollabs.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No completed collaborations found
              </p>
            )}
          </div>
        </>
      )}
      {selectedCollab &&
        (currentUser.role === "user" ||
          (currentUser.role === "mentor" &&
            selectedCollab.userId === currentUser.id)) && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            collaborationData={selectedCollab}
            onComplete={handleFeedbackComplete}
          />
        )}
    </div>
  );
};

export default ActiveCollaborations;
