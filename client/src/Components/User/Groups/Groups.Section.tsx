import { FaUsers, FaCalendarAlt} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GroupsSection = ({ groups }) => {
  const navigate = useNavigate();

  const handleGroupClick = (groupId) => {
    navigate(`/groupDetails/${groupId}`); // Navigate to group details page
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Your Groups</h2>
      <div className="space-y-4">
        {groups?.map((group) => (
          <div key={group._id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
          onClick={() => handleGroupClick(group._id)}
          >
            <div className="flex items-center space-x-4">
              {/* Group Image */}
              <img
                src={group.profilePic || "/api/placeholder/100/100"}
                alt={group.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Group Details */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{group.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{group.bio}</p>

                {/* Group Stats */}
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <FaUsers className="mr-1" />
                    <span>{group.members.length}/{group.maxMembers} members</span>
                  </div>
                  {group.price > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ₹{group.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Time Slots Preview */}
              <div className="hidden md:block">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {group.availableSlots.length > 0 && (
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      <span>{group.availableSlots[0].day} - {group.availableSlots[0].timeSlots[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!groups || groups.length === 0) && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No groups created yet
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupsSection;