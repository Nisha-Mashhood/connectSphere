import { UserConnection } from "../../../redux/types";

interface ConnectionCardProps {
  conn: UserConnection;
  onClick: (id: string) => void;
}

const getStatusBadge = (req: string, conn: string) => {
  if (req === "Pending") return "bg-yellow-100 text-yellow-800";
  if (req === "Accepted" && conn === "Connected")
    return "bg-green-100 text-green-800";
  if (req === "Accepted" && conn === "Disconnected")
    return "bg-red-100 text-red-800";
  if (req === "Rejected") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const getBadgeLabel = (req: string, conn: string) =>
  req === "Accepted" && conn === "Disconnected" ? "Disconnected" : req;

const getConnectionStatus = (conn: string) =>
  conn === "Connected" ? "bg-green-500" : "bg-red-500";

export default function ConnectionCard({ conn, onClick }: ConnectionCardProps) {
  return (
    <div
      key={conn.id}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => onClick(conn.id)}
    >
      <div className="p-5">
        {/* Status badge + dot */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
              conn.requestStatus,
              conn.connectionStatus
            )}`}
          >
            {getBadgeLabel(conn.requestStatus, conn.connectionStatus)}
          </span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Status:</span>
            <span
              className={`h-3 w-3 rounded-full ${getConnectionStatus(
                conn.connectionStatus
              )}`}
            ></span>
          </div>
        </div>

        {/* Requester */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={conn.requester.profilePic}
            alt={conn.requester.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900">{conn.requester.name}</h3>
            <p className="text-xs text-gray-500">{conn.requester.jobTitle}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Recipient */}
        <div className="flex items-center space-x-4">
          <img
            src={conn.recipient.profilePic}
            alt={conn.recipient.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900">{conn.recipient.name}</h3>
            <p className="text-xs text-gray-500">{conn.recipient.jobTitle}</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Requested: {new Date(conn.requestSentAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
