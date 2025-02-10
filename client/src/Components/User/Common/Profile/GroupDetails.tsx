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
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaTrash,
  FaCamera,
} from "react-icons/fa";

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

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {group && (
        <>
          {/* Group Cover Image */}
          <div
            className="relative h-40 md:h-60"
            onMouseEnter={() => setIsHoveringCover(true)}
            onMouseLeave={() => setIsHoveringCover(false)}
          >
            <img
              src={group.coverPic || "https://via.placeholder.com/1200x400"}
              alt="Group Cover"
              className="w-full h-full object-cover"
            />
            {isHoveringCover && group.adminId === currentUser._id && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, "cover")}
                  />
                  Change Cover Photo
                </label>
              </div>
            )}
            <div
              className="absolute bottom-[-40px] left-4"
              onMouseEnter={() => setIsHoveringProfile(true)}
              onMouseLeave={() => setIsHoveringProfile(false)}
            >
              <div className="relative">
                <img
                  src={group.profilePic || "https://via.placeholder.com/100"}
                  alt="Group Profile"
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                />
                {isHoveringProfile && group.adminId === currentUser._id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, "profile")}
                      />
                      <FaCamera className="text-white text-xl" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Group Details */}
          <div className="p-6 mt-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold dark:text-white">
                {group.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{group.bio}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Max Members: {group.maxMembers}
              </p>
            </div>

            {/* Delete Group Button (Only visible for Admin) */}
            {group.adminId === currentUser._id && (
              <button
                onClick={handleDeleteGroup}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
              >
                <FaTrash className="mr-1" />
              </button>
            )}
          </div>
        </>
      )}

      {/* User Requests List */}
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Group Requests
        </h2>

        {groupRequests.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No requests to manage.
          </p>
        )}

        {groupRequests.map((req) => (
          <div
            key={req._id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaUser
                  className="text-blue-500 dark:text-blue-300"
                  size={20}
                />
                <div>
                  <p className="font-semibold dark:text-white">
                    {req.userId.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FaEnvelope className="mr-1" /> {req.userId.email}
                  </p>
                  <p className="text-sm text-gray-500">Status: {req.status}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {req.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleRequestUpdate(req._id, "Accepted")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      <FaCheck className="mr-1" /> Accept
                    </button>
                    <button
                      onClick={() => handleRequestUpdate(req._id, "Rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      <FaTimes className="mr-1" /> Reject
                    </button>
                  </>
                )}
                {req.status === "Accepted" && (
                  <span className="text-green-600 font-bold">Accepted</span>
                )}
                {req.status === "Rejected" && (
                  <span className="text-red-600 font-bold">Rejected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Members List */}
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">Group Members</h2>

        {group?.members?.length > 0 ? (
          group.members
            .filter((member) => member.userId?._id !== group.adminId)
            .map((member) => (
              <div
                key={member._id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      member.userId?.profilePic ||
                      "https://via.placeholder.com/100"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">
                      {member.userId?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {member.userId?.jobTitle || "No job title"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Joining Date:{" "}
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Unknown"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveUser(member.userId?._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No members yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
