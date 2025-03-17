import { Card, CardBody } from "@nextui-org/react";

const CollaborationHeader = ({ collaboration, isMentor }) => {
  const otherPartyDetails = isMentor ? collaboration.userId : collaboration.mentorId?.userId;
  const displayName = otherPartyDetails?.name || "Unknown";
  const profilePic = otherPartyDetails?.profilePic;

  return (
    <Card className="mb-6 shadow-md">
      <CardBody>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profilePic}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
            />
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{isMentor ? "Mentee" : "Mentor"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                collaboration.isCancelled
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {collaboration.isCancelled ? "Cancelled" : "Active"}
            </span>
            <p className="text-xl font-bold">₹{collaboration.price}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CollaborationHeader;