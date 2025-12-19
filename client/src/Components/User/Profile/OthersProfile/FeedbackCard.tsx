import { Feedback } from "../../../../redux/types";
import { useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Chip,
  Button,
  Progress,
} from "@nextui-org/react";
import {
  FaCalendarAlt,
  FaThumbsUp,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";

// Star Rating Component
const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${sizeClass} ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  );
};

// Rating Progress Bar
const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}/5</span>
    </div>
    <Progress
      value={value * 20}
      size="sm"
      color="primary"
      classNames={{
        track: "bg-gray-200",
        indicator: "bg-gradient-to-r from-blue-500 to-purple-500",
      }}
    />
  </div>
);

export const FeedbackCard = ({
  feedback,
  isMentor,
  onProfileClick,
}: {
  feedback: Feedback;
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const giver =
    feedback.givenBy === "user" ? feedback.user : feedback.mentor?.user;
  const giverId =
    feedback.givenBy === "user" ? feedback.user?.id : feedback.mentor?.user?.id;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
      <CardBody className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            src={giver?.profilePic || "/api/placeholder/100/100"}
            name={giver?.name?.charAt(0) || "?"}
            size="lg"
            className="flex-shrink-0 cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
            onClick={() => giverId && onProfileClick(giverId)}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <p
                className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => giverId && onProfileClick(giverId)}
              >
                {giver?.name || "Anonymous"}
              </p>
              <Chip
                size="sm"
                variant="flat"
                startContent={
                  feedback.givenBy === "user" ? (
                    <FaUser className="w-3 h-3" />
                  ) : (
                    <FaGraduationCap className="w-3 h-3" />
                  )
                }
                className="bg-blue-100 text-blue-800"
              >
                {feedback.givenBy === "user" ? "Learner" : "Mentor"}
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <StarRating rating={feedback.rating} size="md" />
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="w-4 h-4" />
                {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {feedback.wouldRecommend && (
                <Chip
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<FaThumbsUp className="w-3 h-3" />}
                >
                  Recommends
                </Chip>
              )}
            </div>
          </div>
        </div>

        {/* Comment */}
        <p className="text-gray-700 leading-relaxed mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          "{feedback.comments}"
        </p>

        <Button
          variant="light"
          size="sm"
          fullWidth
          onPress={() => setExpanded(!expanded)}
          endContent={expanded ? <FaChevronUp /> : <FaChevronDown />}
          className="justify-between text-gray-600 hover:text-gray-900"
        >
          {expanded ? "Hide Detailed Ratings" : "Show Detailed Ratings"}
        </Button>

        {expanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-200">
            <RatingBar label="Communication" value={feedback.communication} />
            <RatingBar
              label={isMentor ? "Expertise" : "Engagement"}
              value={feedback.expertise}
            />
            <RatingBar label="Punctuality" value={feedback.punctuality} />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
