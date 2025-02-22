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
} from "@nextui-org/react";
import {
  FaUser,
  FaCheck,
  FaTimes,
  FaTrash,
  FaCamera,
  FaUserFriends,
} from "react-icons/fa";
import toast from "react-hot-toast";

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState<any[]>([]);
  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);

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

  const fetchGroupdDetailsForMembers = async(id) =>{
    console.log(currentUser);
    //dummy
    const response2 = await groupDetailsForMembers(id);
    console.log("Group details for members: ", response2);
  }


  useEffect(() => {
    fetchGroupdDetailsForMembers(currentUser._id)
  }, []);

  const handleRequestUpdate = async (requestId: string, status: string) => {
    try {
      await updateGroupRequest(requestId, status);
      setGroupRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, status } : req
        )
      );
    } catch (err: any) {
      setError(err.message);
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
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    try {
      await removeGroup(groupId);
      toast.success("Group deleted successfully!");
      navigate("/profile"); // Redirect after deletion
    } catch (err: any) {
      setError(err.message);
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
    console.log(error)
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

  return (
    <div className="max-w-7xl mx-auto p-4">
      {group && (
        <Card className="w-full shadow-md">
          {/* Cover Image Section */}
          <div
            className="relative h-40 md:h-60"
            onMouseEnter={() => setIsHoveringCover(true)}
            onMouseLeave={() => setIsHoveringCover(false)}
          >
            <img
              src={group.coverPic || "/api/placeholder/1200/400"}
              alt="Group Cover"
              className="w-full h-full object-cover"
            />
            {isHoveringCover && group.adminId === currentUser._id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <label className="cursor-pointer">
                  <Button
                    color="default"
                    variant="flat"
                    startContent={<FaCamera />}
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
            
            {/* Profile Picture */}
            <div
              className="absolute -bottom-10 left-6"
              onMouseEnter={() => setIsHoveringProfile(true)}
              onMouseLeave={() => setIsHoveringProfile(false)}
            >
              <div className="relative">
                <Avatar
                  src={group.profilePic || "/api/placeholder/200/200"}
                  className="w-20 h-20 text-large border-4 border-white"
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
            </div>
          </div>

          <CardBody className="mt-12 px-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{group.name}</h3>
                <p className="text-default-500">{group.bio}</p>
                <Chip className="mt-2" color="primary" variant="flat">
                  {group.maxMembers} Max Members
                </Chip>
              </div>

              {group.adminId === currentUser._id && (
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<FaTrash />}
                  onClick={handleDeleteGroup}
                >
                  Delete Group
                </Button>
              )}
            </div>

            <Divider className="my-6" />

            {/* Group Requests Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaUserFriends />
                Group Requests
              </h2>

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
                    <Card key={req._id}>
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <User
                            name={req.userId.name}
                            description={req.userId.email}
                            avatarProps={{
                              icon: <FaUser />
                            }}
                          />
                          
                          <div className="flex gap-2">
                            {req.status === "Pending" ? (
                              <>
                                <Button
                                  color="success"
                                  variant="flat"
                                  startContent={<FaCheck />}
                                  onClick={() => handleRequestUpdate(req._id, "Accepted")}
                                >
                                  Accept
                                </Button>
                                <Button
                                  color="danger"
                                  variant="flat"
                                  startContent={<FaTimes />}
                                  onClick={() => handleRequestUpdate(req._id, "Rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Chip
                                color={req.status === "Accepted" ? "success" : "danger"}
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

            <Divider className="my-6" />

            {/* Members Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaUserFriends />
                Group Members
              </h2>

              {group?.members?.length > 0 ? (
                <div className="space-y-4">
                  {group.members
                    .filter((member) => member.userId?._id !== group.adminId)
                    .map((member) => (
                      <Card key={member._id}>
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <User
                              name={member.userId?.name || "Unknown"}
                              description={member.userId?.jobTitle || "No job title"}
                              avatarProps={{
                                src: member.userId?.profilePic || "/api/placeholder/100/100"
                              }}
                            />
                            
                            <div className="flex items-center gap-4">
                              <Chip variant="flat" size="sm">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </Chip>
                              <Button
                                color="danger"
                                variant="flat"
                                size="sm"
                                onClick={() => handleRemoveUser(member.userId?._id)}
                              >
                                Remove
                              </Button>
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
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default GroupDetails;
