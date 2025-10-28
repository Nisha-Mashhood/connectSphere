import { FaClock, FaStar } from "react-icons/fa";
import { Tooltip } from "@nextui-org/react";
import { calculateTimeLeft } from "../../../../lib/helperforprofile";
import { CollabData, Feedback, User } from "../../../../redux/types";

interface Props {
  collab: CollabData;
  isCompleted: boolean;
  currentUser: User;
  feedbackData: Record<string, Feedback>;
  onCollabClick: (id: string) => void;
  onProfileClick: (id: string) => void;
  onFeedbackClick: (e: React.MouseEvent, collab: CollabData) => void;
}

export const CollaborationCard = ({
  collab,
  isCompleted,
  currentUser,
  feedbackData,
  onCollabClick,
  onProfileClick,
  onFeedbackClick,
}: Props) => {
  const isUserRole =
    currentUser.role === "user" ||
    (currentUser.role === "mentor" && collab.userId === currentUser.id);
  const displayUser = isUserRole ? collab.mentor?.user : collab.user;

  const renderFeedbackTooltip = () => {
    const feedback = feedbackData[collab.id];
    if (!feedback) return null;
    return (
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow max-w-md">
        <p className="font-semibold">{feedback.user?.name}</p>
        <div className="flex space-x-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        {["communication", "expertise", "punctuality"].map((key) => (
          <p key={key} className="text-sm mt-1">
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {feedback[key]}/5
          </p>
        ))}
        <p className="text-sm mt-1"><strong>Comments:</strong> {feedback.comments}</p>
        <p className="text-sm"><strong>Recommend:</strong> {feedback.wouldRecommend ? "Yes" : "No"}</p>
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border cursor-pointer"
      onClick={() => onCollabClick(collab.id)}
    >
      <div className="flex items-center space-x-4">
        <img
          src={displayUser?.profilePic}
          alt={displayUser?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p
            className="font-semibold hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(isUserRole ? collab.mentorId : collab.userId);
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
              <span>{isCompleted ? "Completed" : calculateTimeLeft(collab.endDate)}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">₹{collab.price}</span>
          </div>
        </div>
        <div className="flex items-center">
          {isCompleted && currentUser.role === "user" ? (
            collab.feedbackGiven ? (
              <button disabled className="px-3 py-1 text-xs rounded-full bg-gray-300 text-gray-700">
                Feedback Provided
              </button>
            ) : (
              <button
                onClick={(e) => onFeedbackClick(e, collab)}
                className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center"
              >
                <FaStar className="mr-1" /> Give Feedback
              </button>
            )
          ) : isCompleted && currentUser.role === "mentor" && collab.feedbackGiven ? (
            <Tooltip content={renderFeedbackTooltip()} placement="top">
              <button disabled className="px-3 py-1 text-xs rounded-full bg-gray-300">
                Feedback Provided
              </button>
            </Tooltip>
          ) : isCompleted && currentUser.role === "mentor" ? (
            <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              No Feedback
            </span>
          ) : (
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
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
                  ((Date.now() - new Date(collab.startDate).getTime()) /
                    (new Date(collab.endDate).getTime() - new Date(collab.startDate).getTime())) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};