import { Button } from "@nextui-org/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { StatusBadge } from "./StatusBadge";
import { UserCard } from "./UserCard";
import { TimeSlotBadge } from "./TimeSlotBadge";
import { formatCurrency, formatDate } from "../../../../pages/User/Profile/helper";
import { RequestData } from "../../../../redux/types";

type Props = {
  details: RequestData;
  onAccept: () => void;
  onReject: () => void;
};

export const RequestDetailsView = ({ details, onAccept, onReject }: Props) => {
  const pending = details.isAccepted === "Pending";

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Mentorship Request Details</h3>
        {pending ? (
          <div className="flex gap-2">
            <Button className="bg-green-100 text-green-600 hover:bg-green-300" onPress={onAccept}>
              <FaCheck size={10} />
            </Button>
            <Button className="bg-red-100 text-red-600 hover:bg-red-300" onPress={onReject}>
              <FaTimes size={10} />
            </Button>
          </div>
        ) : (
          <span
            className={`text-sm font-medium ${
              details.isAccepted === "Accepted" ? "text-green-600" : "text-red-600"
            }`}
          >
            {details.isAccepted}
          </span>
        )}
      </div>

      {/* Same grid as Collaboration, but without dates */}
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

        {/* Status */}
        <div className="bg-gray-50 p-4 rounded">
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={details.paymentStatus} />
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