import { User } from "../../../../redux/types";

interface Props {
  admin: User;
}

const GroupAdminCard: React.FC<Props> = ({ admin }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4">Group Admin</h3>
    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
      <img
        src={admin?.profilePic}
        alt={admin?.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="ml-4">
        <p className="font-medium text-gray-800">{admin?.name}</p>
        <p className="text-gray-600 text-sm">{admin?.jobTitle}</p>
        <p className="text-gray-500 text-sm">{admin?.email}</p>
      </div>
    </div>
  </div>
);

export default GroupAdminCard;
