import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchGroupDetailsForMembers } from "../../../../redux/Slice/profileSlice";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";

const GroupCollaborations = ({ handleProfileClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { groupMemberships } = useSelector((state: RootState) => state.profile);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const filteredGroupmembership = groupMemberships?.filter(
    (group) => group.adminId?._id !== currentUser._id
  );

  const handleGroupClick = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchGroupDetailsForMembers(currentUser._id));
    }
  }, [dispatch, currentUser]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Group Collaborations
      </h2>
      <div className="space-y-4">
        {filteredGroupmembership?.map((group) => (
          <div
            key={group._id}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
            onClick={() => handleGroupClick(group._id)}
          >
            <div className="flex items-center space-x-4">
              {/* Group Image */}
              <img
                src={group.profilePic || "/api/placeholder/200/200"}
                alt="Group"
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Group Details */}
              <div className="flex-1">
                {/* Group Name */}
                <p className="font-semibold text-gray-900 dark:text-white">
                  {group.name}
                </p>

                {/* Member Count */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaUsers className="text-blue-500" />
                  <span>{group.members?.length || 0} members</span>
                </div>

                {/* Admin Info */}
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span
                    className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={() => handleProfileClick(group.adminId?._id)}
                  >
                    Admin: {group.adminId?.name}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {group.status || "Active"}
                </span>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => navigate(`/chat/group/${group._id}`)}
                >
                  Chat
                </Button>
              </div>
            </div>

            {/* Group Description */}
            <div className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
              {group.description}
            </div>
          </div>
        ))}

        {(!groupMemberships || groupMemberships.length === 0) && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No group collaborations found
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupCollaborations;
