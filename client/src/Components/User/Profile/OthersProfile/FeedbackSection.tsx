import React, { useState } from "react";
import { FaStar, FaCalendarAlt, FaThumbsUp, FaUser, FaGraduationCap } from "react-icons/fa";
import { Mentor, User } from "../../../../redux/types";

interface Feedback {
  id: string;
  rating: number;
  comments: string;
  createdAt: Date;
  wouldRecommend: boolean;
  communication: number;
  expertise: number;
  punctuality: number;
  givenBy: "user" | "mentor";
  user?: User;
  mentor?: Mentor;
}

interface Props {
  feedbacks: Feedback[];
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}

const renderStars = (rating: number) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        className={`w-4 h-4 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}
      />
    ))}
    <span className="text-sm font-medium text-gray-700 ml-1">{rating}/5</span>
  </div>
);

export const FeedbackSection: React.FC<Props> = ({
  feedbacks,
  isMentor,
  onProfileClick,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!feedbacks.length)
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center py-10">
        <FaStar className="mx-auto text-gray-300 text-4xl mb-3" />
        <p className="text-gray-600">No feedback available yet.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Feedback & Reviews</h2>
        <FaStar className="text-yellow-500 text-xl" />
      </div>

      <div className="space-y-6">
        {feedbacks.map((f) => {
          const giver = f.givenBy === "user" ? f.user : f.mentor?.user;
          const giverId = f.givenBy === "user" ? f.user?.id : f.mentor?.user?.id;

          return (
            <div
              key={f.id}
              className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <img
                  src={giver?.profilePic || "/api/placeholder/150/150"}
                  alt={giver?.name}
                  className="h-14 w-14 rounded-full border-2 border-white shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => giverId && onProfileClick(giverId)}
                      >
                        {giver?.name}
                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {f.givenBy === "user" ? (
                            <FaUser className="mr-1 text-xs" />
                          ) : (
                            <FaGraduationCap className="mr-1 text-xs" />
                          )}
                          {f.givenBy}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="hidden md:flex">{renderStars(f.rating)}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden mt-2">{renderStars(f.rating)}</div>

                  <p className="mt-3 text-gray-700">{f.comments}</p>

                  <div
                    className="mt-4 pt-3 border-t border-gray-200 cursor-pointer"
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600">
                        {expanded === f.id ? "Hide details" : "Show rating details"}
                      </p>
                      <span className="text-sm text-gray-500">
                        {f.wouldRecommend ? (
                          <span className="text-green-600 flex items-center">
                            <FaThumbsUp className="mr-1" /> Would recommend
                          </span>
                        ) : (
                          <span className="text-red-600">Would not recommend</span>
                        )}
                      </span>
                    </div>

                    {expanded === f.id && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Communication</p>
                          {renderStars(f.communication)}
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">
                            {isMentor ? "Expertise" : "Engagement"}
                          </p>
                          {renderStars(f.expertise)}
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Punctuality</p>
                          {renderStars(f.punctuality)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};