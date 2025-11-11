import { UserConnection } from "../../../../redux/types";

interface Props {
  user: UserConnection["requester"];
  role: string;
}

const UserProfileCard: React.FC<Props> = ({ user, role }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`p-3 border-b border-gray-200 ${
          role === "Requester" ? "bg-blue-50" : "bg-purple-50"
        }`}
      >
        <h3
          className={`font-semibold ${
            role === "Requester" ? "text-blue-700" : "text-purple-700"
          }`}
        >
          {role}
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-start space-x-4">
          <img
            src={user.profilePic}
            alt={user.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-600">{user.jobTitle}</p>
            <p className="text-sm text-gray-500 mt-1">{user.industry}</p>
          </div>
        </div>

        <div className="mt-4 text-sm space-y-2">
          <p>
            <span className="text-gray-500">Email: </span>
            <span className="text-gray-800">{user.email}</span>
          </p>
          {/* <p>
            <span className="text-gray-500">Phone: </span>
            <span className="text-gray-800">{user.phone}</span>
          </p> */}
          {user.reasonForJoining && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-700">
                Reason for Joining:
              </h5>
              <p className="text-sm text-gray-600 italic">
                "{user.reasonForJoining}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
