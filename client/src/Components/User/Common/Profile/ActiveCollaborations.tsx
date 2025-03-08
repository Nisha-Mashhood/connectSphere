import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { AppDispatch, RootState } from "../../../../redux/store";
import { calculateTimeLeft } from "../../../../lib/helperforprofile";
import { FaClock, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "./FeedbackModal";
import { fetchCollabDetails } from "../../../../redux/Slice/profileSlice";

const ActiveCollaborations = ({ handleProfileClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch collaboration data when component mounts or when currentUser changes
  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(
        fetchCollabDetails({
          userId: currentUser._id,
          role: currentUser.role,
        })
      );
    }
  }, [dispatch, currentUser]);

  const handleCollabClick = (collabId) => {
    navigate(`/collaboration/${collabId}`);
  };

  const handleFeedbackClick = (e, collab) => {
    e.stopPropagation(); // Prevent navigation when clicking the feedback button
    setSelectedCollab(collab);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackComplete = () => {
    // refresh the collaborations after feedback is submitted
    dispatch(
      fetchCollabDetails({
        userId: currentUser._id,
        role: currentUser.role,
      })
    );
    console.log("Feedback completed");
  };

  // Sort collaborations into ongoing and completed
  const currentDate = new Date();
  console.log("Collab Data:", collabDetails);

  const ongoingCollabs =
    collabDetails?.data?.filter(
      (collab) => new Date(collab.endDate) > currentDate && !collab.isCancelled
    ) || [];

  const completedCollabs =
    collabDetails?.data?.filter(
      (collab) => new Date(collab.endDate) <= currentDate || collab.isCancelled
    ) || [];

  const renderCollaboration = (collab, isCompleted = false) => (
    <div
      key={collab._id}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
      onClick={() => handleCollabClick(collab._id)}
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <img
          src={
            currentUser.role === "user"
              ? collab.mentorId?.userId?.profilePic
              : collab.userId?.profilePic
          }
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover"
        />

        {/* Collab Details */}
        <div className="flex-1">
          {/* Name */}
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

          {/* Time Slots */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>{collab.selectedSlot[0].day}</span>
            <span>•</span>
            <span>{collab.selectedSlot[0].timeSlots.join(", ")}</span>
          </div>

          {/* Time Left & Price */}
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

        {/* Status Badge or Feedback Button */}
        <div className="flex items-center">
          {isCompleted ? (
            currentUser.role === "user" && (
              <button
                onClick={(e) => handleFeedbackClick(e, collab)}
                className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center"
              >
                <FaStar className="mr-1" /> Feedback
              </button>
            )
          ) : (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar for ongoing collabs */}
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
      {/* Ongoing Collaborations Section */}
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

      {/* Completed Collaborations Section */}
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

      {/* Feedback Modal */}
      {selectedCollab && (
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