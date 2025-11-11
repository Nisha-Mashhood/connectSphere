import { UserConnection } from "../../../../redux/types";

interface Props {
  connection: UserConnection;
}

const ConnectionTimeline: React.FC<Props> = ({ connection }) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Connection Timeline
      </h3>
      <div className="border-l-2 border-blue-200 pl-4">
        <div className="mb-4 relative">
          <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-blue-500"></div>
          <p className="text-sm font-medium text-gray-800">Request Sent</p>
          <p className="text-xs text-gray-500">
            {formatDate(connection.requestSentAt)}
          </p>
        </div>

        {connection.updatedAt !== connection.requestSentAt && (
          <div className="mb-4 relative">
            <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-purple-500"></div>
            <p className="text-sm font-medium text-gray-800">Last Updated</p>
            <p className="text-xs text-gray-500">
              {formatDate(connection.updatedAt)}
            </p>
          </div>
        )}

        {connection.disconnectionReason && (
          <div className="relative">
            <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-red-500"></div>
            <p className="text-sm font-medium text-gray-800">Disconnected</p>
            <p className="text-xs text-gray-600">
              Reason: {connection.disconnectionReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTimeline;
