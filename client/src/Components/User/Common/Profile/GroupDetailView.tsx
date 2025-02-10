import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsers, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import { RootState } from '../../../../redux/store';
import { removeUserFromGroup } from '../../../../Service/Group.Service';
import toast from 'react-hot-toast';

const GroupDetailView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { groupMemberships } = useSelector((state: RootState) => state.profile);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const group = groupMemberships?.find((g) => g._id === groupId);

    // Filter out admin from members list
    const membersList = group.members.filter(
        member => member.userId._id !== group.adminId._id
      );

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">Group not found</p>
      </div>
    );
  }

  const handleExitGroup = async (userId:string) => {
    if (!groupId) return;
    const data = {
      groupId,
      userId
    };
    try {
      await removeUserFromGroup(data);
      toast.success("You exited from th egroup successfully");
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <div className="relative w-full h-64">
        <img
          src={group.coverPic || "/api/placeholder/1200/300"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Group Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative -mt-32">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <img
                  src={group.profilePic || "/api/placeholder/200/200"}
                  alt="Group"
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {group.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {group.bio}
                  </p>
                </div>
              </div>
              
              {currentUser._id !== group.adminId._id && (
                <button
                onClick={() => handleExitGroup(currentUser._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FaSignOutAlt />
                <span>Exit Group</span>
              </button>
              )}
            </div>

            {/* Group Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Admin Details
                </h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={group.adminId.profilePic || "/api/placeholder/100/100"}
                    alt="Admin"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium dark:text-white">{group.adminId.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {group.adminId.jobTitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Group Info
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <FaUsers className="inline mr-2" />
                    {group.members.length} / {group.maxMembers} members
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt className="inline mr-2" />
                    Started {new Date(group.startDate).toLocaleDateString()}
                  </p>
                  {group.price > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Price: ₹{group.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Available Slots
                </h3>
                <div className="space-y-2">
                  {group.availableSlots.map((slot) => (
                    <div key={slot._id} className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium">{slot.day}</p>
                      <p>{slot.timeSlots.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Members
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {membersList.map((member) => (
                  <div
                    key={member._id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4"
                  >
                    <img
                      src={member.userId.profilePic || "/api/placeholder/100/100"}
                      alt={member.userId.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.userId.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.userId.jobTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailView;