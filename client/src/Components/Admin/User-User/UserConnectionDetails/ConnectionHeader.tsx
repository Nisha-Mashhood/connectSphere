import { UserConnection } from "../../../../redux/types";

interface Props {
  connection: UserConnection;
  navigate: (path: string | number) => void;
}

const ConnectionHeader: React.FC<Props> = ({ connection, navigate }) => {
  const getStatusColor = (status: string) => {
    if (status === "Accepted")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "Pending")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === "Rejected") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-blue-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">
          Collaboration Details
        </h1>
        <div className="flex items-center">
          <span className="text-sm text-white opacity-90 mr-2">Status:</span>
          <div
            className={`${getStatusColor(
              connection.requestStatus
            )} px-3 py-1 rounded-full text-sm font-medium border`}
          >
            {connection.requestStatus}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionHeader;
