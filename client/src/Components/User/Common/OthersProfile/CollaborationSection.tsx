import React from "react";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Mentor, User } from "../../../../redux/types";

interface CollabData {
  id: string;
  user?: User;
  mentor?: Mentor;
  userId: string;
  mentorId: string;
  isCompleted: boolean;
  isCancelled: boolean;
}

interface Props {
  collabData: CollabData[];
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}

const CollabItem = ({
  collab,
  isMentor,
  onProfileClick,
}: {
  collab: CollabData;
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}) => {
  const other = isMentor ? collab.user : collab.mentor?.user;
  const otherId = isMentor ? collab.userId : collab.mentorId;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center space-x-4">
        <img
          src={other?.profilePic || "/api/placeholder/150/150"}
          alt={other?.name}
          className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover"
        />
        <div>
          <p
            className="font-medium text-gray-900 cursor-pointer hover:underline"
            onClick={() => onProfileClick(otherId)}
          >
            {other?.name}
          </p>
          <p className="text-sm text-gray-600">
            {isMentor ? other?.email : collab.mentor?.specialization}
          </p>
        </div>
      </div>
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          collab.isCompleted
            ? "bg-green-100 text-green-800"
            : collab.isCancelled
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {collab.isCompleted
          ? "Completed"
          : collab.isCancelled
          ? "Cancelled"
          : "Ongoing"}
      </span>
    </div>
  );
};

export const CollaborationSection: React.FC<Props> = ({
  collabData,
  isMentor,
  onProfileClick,
}) => {
  const ongoing = collabData.filter((c) => !c.isCompleted && !c.isCancelled);
  const completed = collabData.filter((c) => c.isCompleted);
  const cancelled = collabData.filter((c) => c.isCancelled);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Collaborations</h2>
        <FaClock className="text-green-500 text-xl" />
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ONGOING */}
        <div>
          <h3 className="font-medium text-lg text-blue-700 mb-3 flex items-center gap-2">
            <FaClock className="text-blue-600" /> Ongoing
          </h3>
          {ongoing.length ? (
            <div className="space-y-3">
              {ongoing.map((c) => (
                <CollabItem
                  key={c.id}
                  collab={c}
                  isMentor={isMentor}
                  onProfileClick={onProfileClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">None</p>
          )}
        </div>

        {/* COMPLETED */}
        <div>
          <h3 className="font-medium text-lg text-green-700 mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" /> Completed
          </h3>
          {completed.length ? (
            <div className="space-y-3">
              {completed.map((c) => (
                <CollabItem
                  key={c.id}
                  collab={c}
                  isMentor={isMentor}
                  onProfileClick={onProfileClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">None</p>
          )}
        </div>

        {/* CANCELLED */}
        <div>
          <h3 className="font-medium text-lg text-red-700 mb-3 flex items-center gap-2">
            <FaTimesCircle className="text-red-600" /> Cancelled
          </h3>
          {cancelled.length ? (
            <div className="space-y-3">
              {cancelled.map((c) => (
                <CollabItem
                  key={c.id}
                  collab={c}
                  isMentor={isMentor}
                  onProfileClick={onProfileClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">None</p>
          )}
        </div>
      </div>
    </div>
  );
};