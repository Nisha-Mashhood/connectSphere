import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../../../redux/store";
import {
  getGroupDetails,
  getGroupRequestsByGroupId,
  groupDetailsForMembers,
  removeGroup,
  removeUserFromGroup,
  updateGroupRequest,
  uploadGroupPicture,
} from "../../../../Service/Group.Service";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Spinner,
  Chip,
  User,
  Divider,
  CardHeader,
} from "@nextui-org/react";
import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaCamera,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUsers,
  FaClock,
  FaDollarSign,
  FaBell,
} from "react-icons/fa";
import toast from "react-hot-toast";
import TaskManagement from "../../TaskManagement/TaskManagemnt";

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState<any[]>([]);
  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const groupResponse = await getGroupDetails(groupId);
      console.log("Group Response:", groupResponse);

      if (groupResponse?.data) {
        setGroup(groupResponse.data);
      } else {
        setError("Failed to fetch group details");
      }

      const requestsResponse = await getGroupRequestsByGroupId(groupId);
      console.log("Group Requests:", requestsResponse);

      if (requestsResponse?.data) {
        setGroupRequests(requestsResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching group details:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupdDetailsForMembers = async (id) => {
    console.log(currentUser);
    const response2 = await groupDetailsForMembers(id);
    console.log("Group details for members: ", response2);
  };

  useEffect(() => {
    fetchGroupdDetailsForMembers(currentUser._id);
  }, []);

  const handleRequestUpdate = async (requestId: string, status: string) => {
    try {
      const response = await updateGroupRequest(requestId, status);
      toast.success(response.message || `Request ${status.toLowerCase()}`);
      await fetchGroupDetails(); // Refresh group and requests
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update request");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!groupId) return;
    const data = {
      groupId,
      userId,
    };
    try {
      await removeUserFromGroup(data);
      toast.success("Member removed successfully");
      fetchGroupDetails();
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to remove member");
    }
  };

  const handleExitGroup = async () => {
    if (!groupId) return;
    try {
      await removeUserFromGroup({ groupId, userId: currentUser._id });
      toast.success("You have successfully exited the group");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to exit group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await removeGroup(groupId);
      toast.success("Group deleted successfully!");
      navigate("/profile"); // Redirect after deletion
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to delete group");
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    if (!event.target.files || !event.target.files[0]) return;

    const formData = new FormData();
    const fieldName = type === "profile" ? "profilePic" : "coverPic";
    formData.append(fieldName, event.target.files[0]);

    try {
      const response = await uploadGroupPicture(groupId, formData);

      if (response) {
        if (type === "profile") {
          setGroup({ ...group, profilePic: response.updatedGroup.profilePic });
        } else {
          setGroup({ ...group, coverPic: response.updatedGroup.coverPic });
        }
        toast.success(`${type} photo updated successfully`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update photo");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardBody>
          <p className="text-danger text-center">{error}</p>
        </CardBody>
      </Card>
    );
  }

  // Filter out admin from members list if available
  const membersList =
    group?.members?.filter(
      (member) => member.userId?._id !== group.adminId._id
    ) || [];

  const pendingRequestsCount = groupRequests.filter(
    (req) => req.status === "Pending"
  ).length;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <div className="relative w-full h-64">
        <img
          src={group.coverPic || "/api/placeholder/1200/300"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Cover Image Upload Button */}
        {group.adminId._id === currentUser._id && (
          <div className="absolute bottom-4 right-4">
            <label className="cursor-pointer">
              <Button
                color="default"
                variant="flat"
                startContent={<FaCamera />}
                size="sm"
                className="bg-white/80 backdrop-blur-md"
              >
                Change Cover
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, "cover")}
                />
              </Button>
            </label>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative -mt-32">
          <Card className="shadow-lg">
            <CardBody className="p-6">
              {/* Group Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div
                    className="relative"
                    onMouseEnter={() => setIsHoveringProfile(true)}
                    onMouseLeave={() => setIsHoveringProfile(false)}
                  >
                    <Avatar
                      src={group.profilePic || "/api/placeholder/200/200"}
                      size="lg"
                      className="w-24 h-24 text-large"
                    />
                    {isHoveringProfile && group.adminId === currentUser._id && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <label className="cursor-pointer">
                          <FaCamera className="text-white text-xl" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, "profile")}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    <p className="text-default-500 mt-2">{group.bio}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Chip color="primary" variant="flat">
                        {group.maxMembers} Max Members
                      </Chip>
                      <Chip color="secondary" variant="flat">
                        {group.members?.length || 0} Members
                      </Chip>
                      {pendingRequestsCount > 0 &&
                        group.adminId === currentUser._id && (
                          <Chip color="warning" variant="flat">
                            {pendingRequestsCount} Pending Request
                            {pendingRequestsCount !== 1 ? "s" : ""}
                          </Chip>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-start mt-4 md:mt-0">
                  {group.adminId._id === currentUser._id ? (
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<FaTrash />}
                      onClick={handleDeleteGroup}
                    >
                      Delete Group
                    </Button>
                  ) : (
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<FaSignOutAlt />}
                      onClick={handleExitGroup}
                    >
                      Exit Group
                    </Button>
                  )}
                </div>
              </div>

              {/* Task Management Section */}
              <Card className="mt-8">
                <CardHeader className="flex gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-xl text-primary" />
                    <p className="text-lg font-semibold">My Tasks</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <TaskManagement
                    context="group"
                    currentUser={currentUser}
                    contextData={group}
                  />
                </CardBody>
              </Card>

              <Divider className="my-8" />

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin Card */}
                <Card>
                  <CardBody>
                    <h3 className="font-semibold mb-4">Admin Details</h3>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={
                          group.adminId?.profilePic ||
                          "/api/placeholder/100/100"
                        }
                        size="md"
                      />
                      <div>
                        <p className="font-medium">
                          {group.adminId?.name || "Admin"}
                        </p>
                        <p className="text-sm text-default-500">
                          {group.adminId?.jobTitle || ""}
                        </p>
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
                        <span>
                          {group.members?.length || 0} / 4 members{" "}
                          {group.isFull ? "(Full)" : ""}
                          members
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-default-500">
                        <FaCalendarAlt />
                        <span>
                          Created{" "}
                          {new Date(
                            group.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
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

                {/* Group Requests Card (Only for admin) */}
                {group.adminId === currentUser._id ? (
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FaBell />
                        <span>Join Requests</span>
                        {pendingRequestsCount > 0 && (
                          <Chip size="sm" color="danger" variant="solid">
                            {pendingRequestsCount}
                          </Chip>
                        )}
                      </h3>
                      {pendingRequestsCount === 0 ? (
                        <p className="text-default-500">No pending requests</p>
                      ) : (
                        <div className="space-y-3">
                          {groupRequests
                            .filter((req) => req.status === "Pending")
                            .slice(0, 2)
                            .map((req) => (
                              <div
                                key={req._id}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar
                                    src={
                                      req.userId.profilePic ||
                                      "/api/placeholder/100/100"
                                    }
                                    size="sm"
                                  />
                                  <span className="text-sm">
                                    {req.userId.name}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {group.isFull && req.status === "Pending" ? (
                                    <Chip
                                      color="danger"
                                      variant="flat"
                                      size="sm"
                                    >
                                      Group is full
                                    </Chip>
                                  ) : req.status === "Pending" ? (
                                    <>
                                      <Button
                                        color="success"
                                        size="sm"
                                        isIconOnly
                                        onClick={() =>
                                          handleRequestUpdate(
                                            req._id,
                                            "Accepted"
                                          )
                                        }
                                        isDisabled={group.isFull}
                                      >
                                        <FaCheck size={14} />
                                      </Button>
                                      <Button
                                        color="danger"
                                        size="sm"
                                        isIconOnly
                                        onClick={() =>
                                          handleRequestUpdate(
                                            req._id,
                                            "Rejected"
                                          )
                                        }
                                      >
                                        <FaTimes size={14} />
                                      </Button>
                                    </>
                                  ) : (
                                    <Chip
                                      color={
                                        req.status === "Accepted"
                                          ? "success"
                                          : "danger"
                                      }
                                      size="sm"
                                    >
                                      {req.status}
                                    </Chip>
                                  )}
                                </div>
                              </div>
                            ))}
                          {pendingRequestsCount > 2 && (
                            <p className="text-xs text-default-500 text-center mt-2">
                              +{pendingRequestsCount - 2} more pending requests
                            </p>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ) : (
                  // Slots Card (if available)
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold mb-4">Available Slots</h3>
                      {group.availableSlots &&
                      group.availableSlots.length > 0 ? (
                        <div className="space-y-3">
                          {group.availableSlots.map((slot, idx) => (
                            <div key={slot._id || idx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-default-500" />
                                <span className="font-medium">{slot.day}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {slot.timeSlots &&
                                  slot.timeSlots.map((time, index) => (
                                    <Chip key={index} size="sm" variant="flat">
                                      {time}
                                    </Chip>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-default-500">No available slots</p>
                      )}
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Group Requests Section (For admin, full list) */}
              {group.adminId === currentUser._id &&
                groupRequests.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">
                      Join Requests
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {groupRequests.map((req) => (
                        <Card key={req._id}>
                          <CardBody>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <User
                                name={req.userId.name}
                                description={req.userId.email}
                                avatarProps={{
                                  src:
                                    req.userId.profilePic ||
                                    "/api/placeholder/100/100",
                                }}
                              />

                              <div className="flex flex-wrap gap-2">
                                {req.status === "Pending" ? (
                                  <>
                                    <Button
                                      color="success"
                                      variant="flat"
                                      startContent={<FaCheck />}
                                      onClick={() =>
                                        handleRequestUpdate(req._id, "Accepted")
                                      }
                                      size="sm"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      color="danger"
                                      variant="flat"
                                      startContent={<FaTimes />}
                                      onClick={() =>
                                        handleRequestUpdate(req._id, "Rejected")
                                      }
                                      size="sm"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <Chip
                                    color={
                                      req.status === "Accepted"
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {req.status}
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Members Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersList.length > 0 ? (
                    membersList.map((member) => (
                      <Card key={member._id} className="p-4">
                        <CardBody className="p-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={
                                  member.userId?.profilePic ||
                                  "/api/placeholder/100/100"
                                }
                                size="md"
                              />
                              <div>
                                <p className="font-medium">
                                  {member.userId?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-default-500">
                                  {member.userId?.jobTitle || ""}
                                </p>
                                <p className="text-xs text-default-400">
                                  Joined{" "}
                                  {new Date(
                                    member.joinedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {group.adminId === currentUser._id && (
                              <Button
                                color="danger"
                                variant="light"
                                size="sm"
                                onClick={() =>
                                  handleRemoveUser(member.userId?._id)
                                }
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <Card>
                        <CardBody>
                          <p className="text-center text-default-500">
                            No members yet
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
