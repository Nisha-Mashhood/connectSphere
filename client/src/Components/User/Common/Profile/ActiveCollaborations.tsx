import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { AppDispatch, RootState } from "../../../../redux/store";
import { calculateTimeLeft } from "../../../../lib/helperforprofile";
import { FaClock, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../../../Forms/FeedbackModal";
import {
  fetchCollabDetails,
  fetchMentorDetails,
} from "../../../../redux/Slice/profileSlice";
import { Tooltip } from "@nextui-org/react";
import { getFeedbackByCollaborationId } from "../../../../Service/Feedback.service";

const ActiveCollaborations = ({ handleProfileClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const dispatch = useDispatch<AppDispatch>();

  // Fetch collaboration data and feedback for mentor view
  const fetchCollaborations = async () => {
    if (currentUser && currentUser._id) {
      try {
        if (currentUser.role === "mentor") {
          const mentorDetails = await dispatch(
            fetchMentorDetails(currentUser._id)
          ).unwrap();
          if (mentorDetails?._id) {
            await dispatch(
              fetchCollabDetails({ userId: mentorDetails._id, role: "mentor" })
            );
          } else {
            console.error("Unable to retrieve mentor details");
          }
        } else {
          await dispatch(
            fetchCollabDetails({ userId: currentUser._id, role: "user" })
          );
        }
      } catch (error) {
        console.error("Error fetching collaborations:", error);
      }
    }
  };

  // Fetch feedback for completed collaborations (mentor view)
  const fetchFeedbackForCollabs = async (collabs) => {
    const feedbackPromises = collabs
      .filter((collab) => collab.feedbackGiven)
      .map(async (collab) => {
        try {
          const feedback = await getFeedbackByCollaborationId(collab._id);
          console.log("FeedBack Accessed :", feedback);
          return { [collab._id]: feedback[0] || null };
        } catch (error) {
          console.error(`Error fetching feedback for collab ${collab._id}:`, error);
          return { [collab._id]: null };
        }
      });
    const feedbackResults = await Promise.all(feedbackPromises);
    const feedbackMap = feedbackResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    setFeedbackData(feedbackMap);
  };

  useEffect(() => {
    fetchCollaborations();
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.role === "mentor" && collabDetails?.data) {
      fetchFeedbackForCollabs(completedCollabs);
    }
  }, [collabDetails, currentUser]);

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

  const currentDate = new Date();
  const ongoingCollabs =
    collabDetails?.data?.filter(
      (collab) => new Date(collab.endDate) > currentDate && !collab.isCancelled
    ) || [];
  const completedCollabs =
    collabDetails?.data?.filter(
      (collab) => new Date(collab.endDate) <= currentDate || collab.isCancelled
    ) || [];

  const renderFeedbackTooltip = (collab) => {
    const feedback = feedbackData[collab._id];
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

  const renderCollaboration = (collab, isCompleted = false) => (
    <div
      key={collab._id}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
      onClick={() => handleCollabClick(collab._id)}
    >
      <div className="flex items-center space-x-4">
        <img
          src={
            currentUser.role === "user"
              ? collab.mentorId?.userId?.profilePic
              : collab.userId?.profilePic
          }
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p
            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              currentUser.role === "user"
                ? handleProfileClick(collab.mentorId?._id)
                : handleProfileClick(collab.userId?._id);
            }}
          >
            {currentUser.role === "user"
              ? collab.mentorId?.userId?.name
              : collab.userId?.name}
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
                {isCompleted ? "Completed" : calculateTimeLeft(collab.endDate)}
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
                className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center"
              >
                <FaStar className="mr-1" /> Give Feedback
              </button>
            )
          ) : isCompleted && currentUser.role === "mentor" && collab.feedbackGiven ? (
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
          {/* <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => navigate(`/chat/user-mentor/${collab._id}`)}
          >
            Chat
          </Button> */}
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Ongoing Collaborations
      </h2>
      <div className="space-y-4 mb-8">
        {ongoingCollabs.map((collab) => renderCollaboration(collab, false))}
        {ongoingCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No ongoing collaborations found
          </p>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Completed Collaborations
      </h2>
      <div className="space-y-4">
        {completedCollabs.map((collab) => renderCollaboration(collab, true))}
        {completedCollabs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No completed collaborations found
          </p>
        )}
      </div>
      {selectedCollab && currentUser.role === "user" && (
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