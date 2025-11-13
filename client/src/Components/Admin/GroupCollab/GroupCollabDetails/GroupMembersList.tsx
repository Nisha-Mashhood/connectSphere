import { User } from "../../../../redux/types";

interface MemberDetail {
  user: User;
  joinedAt: string;
}

interface Props {
  members: MemberDetail[];
  adminId: string;
  onRemove: (userId: string) => void;
  formatDate: (date: string) => string;
}

const GroupMembersList: React.FC<Props> = ({ members, adminId, onRemove, formatDate }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4">Members</h3>
    <div className="bg-gray-50 rounded-lg">
      <ul className="divide-y divide-gray-200">
        {members.map((m, i) => (
          <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-100">
            <div className="flex items-center">
              <img src={m.user.profilePic} alt={m.user.name} className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <p className="font-medium text-gray-800">{m.user.name}</p>
                <p className="text-sm text-gray-500">Joined {formatDate(m.joinedAt)}</p>
              </div>
            </div>
            {m.user.id !== adminId && (
              <button
                onClick={() => onRemove(m.user.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default GroupMembersList;
