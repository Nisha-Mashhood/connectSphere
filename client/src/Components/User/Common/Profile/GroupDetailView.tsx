import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsers, FaCalendarAlt, FaSignOutAlt, FaDollarSign, FaClock } from 'react-icons/fa';
import { RootState } from '../../../../redux/store';
import { removeUserFromGroup } from '../../../../Service/Group.Service';
import { Card, CardBody, Button, Avatar, Chip, Divider } from "@nextui-org/react";
import toast from 'react-hot-toast';

const GroupDetailView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { groupMemberships } = useSelector((state: RootState) => state.profile);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const group = groupMemberships?.find((g) => g._id === groupId);

  // Filter out admin from members list
  const membersList = group?.members.filter(
    member => member.userId._id !== group.adminId._id
  ) || [];

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <p className="text-xl text-default-500">Group not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleExitGroup = async (userId: string) => {
    if (!groupId) return;
    try {
      await removeUserFromGroup({ groupId, userId });
      toast.success("You have successfully exited the group");
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image with Overlay */}
      <div className="relative w-full h-64">
        <img
          src={group.coverPic || "/api/placeholder/1200/300"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative -mt-32">
          <Card className="shadow-lg">
            <CardBody className="p-6">
              {/* Group Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={group.profilePic || "/api/placeholder/200/200"}
                    size="lg"
                    className="w-24 h-24 text-large"
                  />
                  <div>
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    <p className="text-default-500 mt-2">{group.bio}</p>
                  </div>
                </div>
                
                {currentUser._id !== group.adminId._id && (
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<FaSignOutAlt />}
                    onClick={() => handleExitGroup(currentUser._id)}
                  >
                    Exit Group
                  </Button>
                )}
              </div>

              <Divider className="my-8" />

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin Card */}
                <Card>
                  <CardBody>
                    <h3 className="font-semibold mb-4">Admin Details</h3>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={group.adminId.profilePic || "/api/placeholder/100/100"}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">{group.adminId.name}</p>
                        <p className="text-sm text-default-500">{group.adminId.jobTitle}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Group Info Card */}
                <Card>
                  <CardBody>
                    <h3 className="font-semibold mb-4">Group Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-default-500">
                        <FaUsers />
                        <span>{group.members.length} / {group.maxMembers} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-default-500">
                        <FaCalendarAlt />
                        <span>Started {new Date(group.startDate).toLocaleDateString()}</span>
                      </div>
                      {group.price > 0 && (
                        <div className="flex items-center gap-2 text-default-500">
                          <FaDollarSign />
                          <span>₹{group.price}</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Slots Card */}
                <Card>
                  <CardBody>
                    <h3 className="font-semibold mb-4">Available Slots</h3>
                    <div className="space-y-3">
                      {group.availableSlots.map((slot) => (
                        <div key={slot._id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-default-500" />
                            <span className="font-medium">{slot.day}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {slot.timeSlots.map((time, index) => (
                              <Chip key={index} size="sm" variant="flat">
                                {time}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Members Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersList.map((member) => (
                    <Card key={member._id} className="p-4">
                      <CardBody className="p-0">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={member.userId.profilePic || "/api/placeholder/100/100"}
                            size="md"
                          />
                          <div>
                            <p className="font-medium">{member.userId.name}</p>
                            <p className="text-sm text-default-500">{member.userId.jobTitle}</p>
                            <p className="text-xs text-default-400">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailView;