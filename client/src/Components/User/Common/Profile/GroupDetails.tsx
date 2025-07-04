import { useCallback, useEffect, useState, lazy, Suspense, Key } from "react"; 
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
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter, 
} from "@nextui-org/react";
import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaCamera,
  FaUserFriends,
  FaCalendarAlt,
  FaInfoCircle,
  FaBell,
  FaCog,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { Group, GroupRequest } from "../../../../types";

// Lazy load TaskManagement
const TaskManagement = lazy(() => import("../../TaskManagement/TaskManagemnt"));

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState({});
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [selectedTab, setSelectedTab] = useState("tasks");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const groupResponse = await getGroupDetails(groupId);
      console.log("Group Response:", groupResponse);

      if (groupResponse) {
        setGroup(groupResponse);
        console.log("Group Response:", group);
      } else {
        setError("Failed to fetch group details");
      }

      const requestsResponse = await getGroupRequestsByGroupId(groupId);
      console.log("Group Requests:", requestsResponse);

      if (requestsResponse) {
        setGroupRequests(requestsResponse);
      }
    } catch (err) {
      console.error("Error fetching group details:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [group, groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupdDetailsForMembers = useCallback(async (id) => {
    console.log(currentUser);
    const response2 = await groupDetailsForMembers(id);
    console.log("Group details for members: ", response2);
  }, [currentUser]);

  useEffect(() => {
    fetchGroupdDetailsForMembers(currentUser._id);
  }, [currentUser._id, fetchGroupdDetailsForMembers]);

  const handleRequestUpdate = async (requestId: string, status: string) => {
    if (isProcessing[requestId]) return;
    setIsProcessing((prev) => ({ ...prev, [requestId]: true }));
    console.log(`handleRequestUpdate called for requestId: ${requestId}, status: ${status}`);

    try {
      const response = await updateGroupRequest(requestId, status);
      if (response) {
        toast.success(response.message || `Request ${status.toLowerCase()}`);
        await fetchGroupDetails();
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to update request");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [requestId]: false }));
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
    } catch (err) {
      setError(err.message);
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
    setIsDeleteModalOpen(true); 
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    if (!groupId) return;

    try {
      await removeGroup(groupId);
      toast.success("Group deleted successfully!");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to delete group");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false); 
  };

  const handleTabChange = (key: Key) => {
    setSelectedTab(String(key)); 
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
      console.log("Upload response:", response);

      if (response) {
        await fetchGroupDetails();
        toast.success(`${type} photo updated successfully`);
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(error.message || "Failed to update photo");
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

  const pendingRequestsCount = groupRequests.filter(
    (req) => req.status === "Pending"
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {group && (
        <>
          {/* Header Card with Cover and Basic Info */}
          <Card className="w-full shadow-md mb-6">
            <div
              className="relative h-48 md:h-64"
              onMouseEnter={() => setIsHoveringCover(true)}
              onMouseLeave={() => setIsHoveringCover(false)}
            >
              <img
                src={group.coverPic || "/api/placeholder/1200/400"}
                alt="Group Cover"
                className="w-full h-full object-cover"
              />
              {isHoveringCover && group.adminId._id === currentUser._id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <label className="cursor-pointer">
                    <Button
                      color="default"
                      variant="flat"
                      startContent={<FaCamera />}
                      onPress={() =>
                        document
                          .getElementById("cover-pic-hover-input")
                          ?.click()
                      }
                    >
                      Change Cover
                    </Button>
                    <input
                      type="file"
                      id="cover-pic-hover-input"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "cover")}
                    />
                  </label>
                </div>
              )}

              {/* Group Actions Buttons (Top Right) */}
              <div className="absolute top-4 right-4 flex gap-2">
                {group.adminId._id === currentUser._id && (
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<FaTrash />}
                    onPress={handleDeleteGroup}
                    size="sm"
                    className="bg-white/80 backdrop-blur-md"
                  >
                    Delete Group
                  </Button>
                )}
              </div>

              {/* Profile Picture */}
              <div
                className="absolute -bottom-12 left-6"
                onMouseEnter={() => setIsHoveringProfile(true)}
                onMouseLeave={() => setIsHoveringProfile(false)}
              >
                <div className="relative">
                  <Avatar
                    src={group.profilePic || "/api/placeholder/200/200"}
                    className="w-24 h-24 text-large border-4 border-white shadow-md"
                  />
                  {isHoveringProfile &&
                    group.adminId._id === currentUser._id && (
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
              </div>
            </div>

            <CardBody className="mt-12 px-6 pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{group.name}</h2>
                  <p className="text-default-500 mt-1">{group.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Chip
                      color={group.isFull ? "danger" : "secondary"}
                      variant="flat"
                    >
                      {group.members?.length || 0} / 4 Members{" "}
                      {group.isFull ? "(Full)" : ""}
                    </Chip>
                    {pendingRequestsCount > 0 &&
                      group.adminId._id === currentUser._id && (
                        <Chip color="warning" variant="flat">
                          {pendingRequestsCount} Pending Request
                          {pendingRequestsCount !== 1 ? "s" : ""}
                        </Chip>
                      )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Content Tabs Card */}
          <Card className="w-full shadow-md">
            <CardBody className="p-0">
              <Tabs
                aria-label="Group sections"
                selectedKey={selectedTab}
                onSelectionChange={handleTabChange}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "px-6 pt-3",
                  panel: "p-0",
                  tab: "py-3",
                }}
                fullWidth
              >
                <Tab
                  key="tasks"
                  title={
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>Tasks</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <Suspense
                      fallback={
                        <div className="flex justify-center items-center h-32">
                          <Spinner size="lg" label="Loading Tasks..." />
                        </div>
                      }
                    >
                      <TaskManagement
                        context="group"
                        currentUser={currentUser}
                        contextData={group}
                      />
                    </Suspense>
                  </div>
                </Tab>

                <Tab
                  key="members"
                  title={
                    <div className="flex items-center gap-2">
                      <FaUserFriends />
                      <span>Members</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Group Members
                    </h3>

                    {/* Admin Card */}
                    <div className="mb-6">
                      <Card className="bg-primary-50 border-primary">
                        <CardBody>
                          {group.adminId ? (
                            <User
                              name={`${
                                group.adminId?.name || "Unknown"
                              } (Admin)`}
                              description={
                                group.adminId?.jobTitle || "No job title"
                              }
                              avatarProps={{
                                src:
                                  group.adminId?.profilePic ||
                                  "/api/placeholder/100/100",
                                className: "border-2 border-primary",
                              }}
                            />
                          ) : (
                            <p className="text-center">
                              Admin information unavailable
                            </p>
                          )}
                        </CardBody>
                      </Card>
                    </div>

                    {/* Members List */}
                    {group?.members?.length > 0 ? (
                      <div className="space-y-4">
                        {group.members
                          .filter(
                            (member) => member.userId?._id !== group.adminId._id
                          )
                          .map((member) => (
                            <Card
                              key={member._id}
                              className="border border-default-200"
                            >
                              <CardBody>
                                <div className="flex justify-between items-center">
                                  <User
                                    name={member.userId?.name || "Unknown"}
                                    description={
                                      member.userId?.jobTitle || "No job title"
                                    }
                                    avatarProps={{
                                      src:
                                        member.userId?.profilePic ||
                                        "/api/placeholder/100/100",
                                    }}
                                  />

                                  <div className="flex items-center gap-4">
                                    <Chip variant="flat" size="sm">
                                      Joined{" "}
                                      {new Date(
                                        member.joinedAt
                                      ).toLocaleDateString()}
                                    </Chip>
                                    {group.adminId._id === currentUser._id && (
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
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <Card>
                        <CardBody>
                          <p className="text-center text-default-500">
                            No members yet
                          </p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </Tab>

                {group.adminId._id === currentUser._id && (
                  <Tab
                    key="requests"
                    title={
                      <div className="flex items-center gap-2">
                        <FaBell />
                        <span>Requests</span>
                        {pendingRequestsCount > 0 && (
                          <Chip size="sm" color="danger" variant="solid">
                            {pendingRequestsCount}
                          </Chip>
                        )}
                      </div>
                    }
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        Group Join Requests
                      </h3>

                      {groupRequests.length === 0 ? (
                        <Card>
                          <CardBody>
                            <p className="text-center text-default-500">
                              No pending requests
                            </p>
                          </CardBody>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {groupRequests.map((req) => (
                            <Card
                              key={req._id}
                              className={`border ${
                                req.status === "Pending"
                                  ? "border-warning"
                                  : req.status === "Accepted"
                                  ? "border-success"
                                  : "border-danger"
                              }`}
                            >
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
                                    {group.isFull &&
                                    req.status === "Pending" ? (
                                      <Chip color="danger" variant="flat">
                                        Group is full (maximum 4 members)
                                      </Chip>
                                    ) : req.status === "Pending" ? (
                                      <>
                                        <Button
                                          color="success"
                                          variant="flat"
                                          startContent={<FaCheck />}
                                          onClick={() =>
                                            handleRequestUpdate(
                                              req._id,
                                              "Accepted"
                                            )
                                          }
                                          size="sm"
                                          isDisabled={group.isFull}
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          color="danger"
                                          variant="flat"
                                          startContent={<FaTimes />}
                                          onClick={() =>
                                            handleRequestUpdate(
                                              req._id,
                                              "Rejected"
                                            )
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
                      )}
                    </div>
                  </Tab>
                )}

                <Tab
                  key="info"
                  title={
                    <div className="flex items-center gap-2">
                      <FaInfoCircle />
                      <span>About</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Group Information
                    </h3>
                    <Card>
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-default-500">
                              Group Name
                            </h4>
                            <p className="text-lg">{group.name}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-default-500">
                              Description
                            </h4>
                            <p>{group.bio || "No description provided"}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-default-500">
                              Created
                            </h4>
                            <p>
                              {group.createdAt
                                ? new Date(group.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )
                                : "Unknown"}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-default-500">
                              Members
                            </h4>
                            <p>
                              {group.members?.length || 0} of {group.maxMembers}{" "}
                              (max)
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </Tab>

                {group.adminId._id === currentUser._id && (
                  <Tab
                    key="settings"
                    title={
                      <div className="flex items-center gap-2">
                        <FaCog />
                        <span>Settings</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        Group Settings
                      </h3>
                      <Card className="mb-4">
                        <CardBody>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-medium mb-2">
                                Group Photos
                              </h4>
                              <div className="flex flex-wrap gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm text-default-500">
                                    Profile Picture
                                  </p>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      id="profile-pic-input"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handlePhotoUpload(e, "profile")
                                      }
                                    />
                                    <Button
                                      color="primary"
                                      variant="flat"
                                      startContent={<FaCamera />}
                                      size="sm"
                                      onClick={() =>
                                        document
                                          .getElementById("profile-pic-input")
                                          ?.click()
                                      }
                                    >
                                      Change Profile
                                    </Button>
                                  </label>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm text-default-500">
                                    Cover Photo
                                  </p>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      id="cover-pic-input"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handlePhotoUpload(e, "cover")
                                      }
                                    />
                                    <Button
                                      color="primary"
                                      variant="flat"
                                      startContent={<FaCamera />}
                                      size="sm"
                                      onClick={() =>
                                        document
                                          .getElementById("cover-pic-input")
                                          ?.click()
                                      }
                                    >
                                      Change Cover
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <Divider />

                            <div>
                              <h4 className="text-lg font-medium mb-2">
                                Danger Zone
                              </h4>
                              <Button
                                color="danger"
                                variant="flat"
                                startContent={<FaTrash />}
                                onClick={handleDeleteGroup}
                              >
                                Delete This Group
                              </Button>
                              <p className="text-xs text-default-500 mt-2">
                                This action cannot be undone. All group data
                                will be permanently deleted.
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </CardBody>
          </Card>

          {/* Deletion Confirmation Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            size="sm"
          >
            <ModalContent>
              <ModalHeader>Confirm Group Deletion</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this group? This action cannot
                  be undone, and all group data will be permanently deleted.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={handleCancelDelete}
                >
                  Cancel
                </Button>
                <Button color="danger" onPress={handleConfirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </div>
  );
};

export default GroupDetails;