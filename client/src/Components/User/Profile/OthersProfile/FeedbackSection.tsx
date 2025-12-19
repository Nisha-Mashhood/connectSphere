import React from "react";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { FaStar, FaThumbsUp, FaComments } from "react-icons/fa";
import { Feedback } from "../../../../redux/types";
import { FeedbackCard } from "./FeedbackCard";

interface Props {
  feedbacks: Feedback[];
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}


export const FeedbackSection: React.FC<Props> = ({
  feedbacks,
  isMentor,
  onProfileClick,
}) => {
  // Calculate average rating
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const recommendCount = feedbacks.filter((f) => f.wouldRecommend).length;

  if (feedbacks.length === 0) {
    return (
      <Card className="shadow-md">
        <CardBody className="text-center py-16">
          <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No feedback yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Reviews will appear here after sessions are completed.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100">
              <FaComments className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Chip
              variant="flat"
              className="bg-yellow-100 text-yellow-800 font-bold text-lg px-4 py-2"
              startContent={<FaStar className="w-5 h-5 text-yellow-500" />}
            >
              {avgRating} / 5 ({feedbacks.length} reviews)
            </Chip>
            <Chip
              variant="flat"
              className="bg-green-100 text-green-800"
              startContent={<FaThumbsUp className="w-4 h-4" />}
            >
              {recommendCount} recommend{recommendCount !== 1 ? "s" : ""}
            </Chip>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Cards */}
      <div className="grid gap-6">
        {feedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            isMentor={isMentor}
            onProfileClick={onProfileClick}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;