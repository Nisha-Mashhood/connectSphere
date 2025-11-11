import { Button } from "@nextui-org/react";
import { FaTimes } from "react-icons/fa";
import { StatusBadge } from "./StatusBadge";
import { UserCard } from "./UserCard";
import { TimeSlotBadge } from "./TimeSlotBadge";
import { formatCurrency, formatDate } from "../../../../pages/User/Profile/helper";
import { CollabData } from "../../../../redux/types";

type Props = {
  details: CollabData;
  onCancelClick: () => void;
};

export const CollaborationDetailsView = ({ details, onCancelClick }: Props) => {
  const isCancelled = details.isCancelled;
  const isCompleted = new Date(details.endDate) < new Date();

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Collaboration Details</h3>
        {isCancelled ? (
          <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-md">
            Collaboration Cancelled
          </span>
        ) : isCompleted ? (
          <span className="text-sm font-medium text-gray-500 bg-green-100 px-3 py-1 rounded-md">
            Collaboration Completed
          </span>
        ) : (
          <Button className="bg-red-100 text-red-600 hover:bg-red-300" onPress={onCancelClick}>
            <FaTimes size={10} />
          </Button>
        )}
      </div>

      {/* Grid */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Mentor */}
        <div className="bg-gray-50 p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Mentor</dt>
          <dd className="mt-1">
            <UserCard
              name={details.mentor.user.name}
              email={details.mentor.user.email}
              profilePic={details.mentor.user.profilePic}
              extra={details.mentor.specialization}
            />
          </dd>
        </div>

        {/* Mentee */}
        <div className="bg-white p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Mentee</dt>
          <dd className="mt-1">
            <UserCard
              name={details.user.name}
              email={details.user.email}
              profilePic={details.user.profilePic}
              extra={details.user.jobTitle}
            />
          </dd>
        </div>

        {/* Price */}
        <div className="bg-gray-50 p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Price</dt>
          <dd className="mt-1 text-green-600 font-semibold">{formatCurrency(details.price)}</dd>
        </div>

        {/* Slot */}
        <div className="bg-white p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Selected Time Slot</dt>
          <dd className="mt-1">
            <TimeSlotBadge slot={details.selectedSlot} />
          </dd>
        </div>

        {/* Dates */}
        <div className="bg-gray-50 p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Start Date</dt>
          <dd className="mt-1">{formatDate(details.startDate)}</dd>
        </div>
        <div className="bg-white p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">End Date</dt>
          <dd className="mt-1">{formatDate(details.endDate)}</dd>
        </div>

        {/* Status */}
        <div className="bg-gray-50 p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={details.payment} />
          </dd>
        </div>

        {/* Created */}
        <div className="bg-white p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Created</dt>
          <dd className="mt-1">{formatDate(details.createdAt)}</dd>
        </div>

        {/* Bio */}
        {details.mentor?.bio && (
          <div className="bg-gray-50 p-4 rounded sm:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Mentor Bio</dt>
            <dd className="mt-1">{details.mentor.bio}</dd>
          </div>
        )}
      </dl>
    </>
  );
};