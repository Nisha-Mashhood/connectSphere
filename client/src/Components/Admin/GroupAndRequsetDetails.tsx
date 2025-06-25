import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getGroupDetails,
  getGroupRequestDetails,
  removeGroup,
  removeUserFromGroup,
  updateGroupRequest,
} from "../../Service/Group.Service";
import toast from "react-hot-toast";

const GroupDetails = () => {
  const { groupId, requestId } = useParams<{
    groupId?: string;
    requestId?: string;
  }>();
  const [group, setGroup] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDetails = useCallback(async () => {
    try {
      if (groupId) {
        const groupData = await getGroupDetails(groupId);
        setGroup(groupData.data);
        console.log("Group Data:", groupData);
      } else if (requestId) {
        const requestData = await getGroupRequestDetails(requestId);
        setRequest(requestData);
        setGroup(requestData.groupId);
        console.log("Request Data:", requestData);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  },[groupId,requestId])

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRemoveGroup = async () => {
    if (!groupId) return;

    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }
    alert(groupId);
    try {
      await removeGroup(groupId);
      toast.success("Group deleted successfully!");
      navigate("/admin/groupManagemnt");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err);
        toast.error("Failed to delete group");
      }else{
        toast.error("An unknown error occurred");
        console.error("Unknown error:", err);
      }
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!groupId) return;
    const data = {
      groupId,
      userId,
    };
    alert(data);
    try {
      await removeUserFromGroup(data);
      toast.success("Member removed successfully");
      fetchDetails();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err);
        toast.error("Failed to remove member");
      }else{
        toast.error("An unknown error occurred");
        console.error("Unknown error:", err);
      }
    }
  };

  const handleRequestUpdate = async (status: string) => {
    try {
      await updateGroupRequest(requestId, status);
      toast.success(`Request ${status.toLowerCase()}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err);
        toast.error("Failed to update request");
      }else{
        toast.error("An unknown error occurred");
        console.error("Unknown error:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!group && !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">
            Details Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The requested group or request information could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with Cover Image */}
        <div className="relative w-full">
          {/* Cover Image */}
          <div className="w-full h-48 bg-gray-200 relative">
            {/* Back Button - Positioned inside the cover pic */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 text-black-600 hover:text-black-100 transition-colors z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            {group?.coverPic ? (
              <img
                src={group.coverPic}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Group name on cover */}
            <div className="absolute bottom-4 left-4 text-white text-2xl font-bold">
              {group?.name || "Request Details"}
            </div>
          </div>

          {/* Group profile picture - positioned to overlap */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2 pt-14">
            {group?.profilePic && (
              <div className="rounded-full border-4 border-white overflow-hidden w-24 h-24 bg-white shadow-md">
                <img
                  src={group.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              onClick={() => handleRemoveGroup()}
            >
              Delete Group
            </button>
          </div>
        </div>

        <div className="p-12 pt-20">
          {/* Group Details */}
          {group && (
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Group Information
                  </h2>

                  {/* Price & Start Date */}
                  <div className="flex flex-col md:flex-row md:space-x-4 mt-2 md:mt-0">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ${group.price} membership fee
                    </span>

                    {group.startDate && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Started: {formatDate(group.startDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 italic">{group.bio}</p>
                </div>

                {/* Group stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="text-xl font-semibold">
                      {group.members?.length || 0} / {group.maxMembers || "∞"}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-xl font-semibold">
                      {formatDate(group.createdAt)}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Available time slots
                    </p>
                    <p className="text-xl font-semibold">
                      {group.availableSlots?.length || 0} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Group Admin
                </h3>
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  {group.adminId?.profilePic ? (
                    <img
                      src={group.adminId.profilePic}
                      alt={group.adminId.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {group.adminId?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                  )}

                  <div className="ml-4">
                    <p className="font-medium text-gray-800">
                      {group.adminId?.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {group.adminId?.jobTitle}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {group.adminId?.email}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {group.adminId?.industry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Slots */}
              {group.availableSlots && group.availableSlots.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Available Time Slots
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.availableSlots.map((slot, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">
                          {slot.day}
                        </h4>
                        <div className="mt-2 space-y-1">
                          {slot.timeSlots &&
                            slot.timeSlots.map((time, idx) => (
                              <div
                                key={idx}
                                className="text-sm bg-white px-3 py-1 rounded border border-gray-200"
                              >
                                {time}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {group.members && group.members.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Members ({group.members.length} / {group.maxMembers || "∞"})
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {group.members.map((member, index) => (
                        <li
                          key={index}
                          className="p-4 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center">
                            {member.userId.profilePic ? (
                              <img
                                src={member.userId.profilePic}
                                alt={member.userId.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {member.userId.name?.charAt(0) || "M"}
                                </span>
                              </div>
                            )}
                            <div className="ml-3">
                              <p className="font-medium text-gray-800">
                                {member.userId.name}
                              </p>
                              <div className="flex items-center text-gray-500 text-sm">
                                <span>{member.userId.jobTitle}</span>
                                <span className="mx-2">•</span>
                                <span>
                                  Joined {formatDate(member.joinedAt)}
                                </span>
                              </div>
                            </div>
                            {group.adminId?._id !== member.userId._id && (
                              <button
                                onClick={() =>
                                  handleRemoveMember(member.userId._id)
                                }
                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 ml-auto"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Request Details */}
          {request && (
            <div className="space-y-6 mt-6">
              <div className="border rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Membership Request
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      Requester Information
                    </h3>

                    <div className="flex items-start">
                      {request.userId.profilePic ? (
                        <img
                          src={request.userId.profilePic}
                          alt={request.userId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {request.userId.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}

                      <div className="ml-4">
                        <p className="font-medium text-gray-800">
                          {request.userId.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {request.userId.jobTitle}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {request.userId.email}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {request.userId.industry}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {request.userId.phone}
                        </p>
                      </div>
                    </div>

                    {request.userId.reasonForJoining && (
                      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Reason for joining
                        </p>
                        <p className="text-gray-700">
                          {request.userId.reasonForJoining}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Request Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      Request Status
                    </h3>

                    <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">
                          Request Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">
                          Payment Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : request.paymentStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.paymentStatus}
                        </span>
                      </div>

                      {request.paymentStatus === "Completed" &&
                        request.paymentId && (
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-sm">
                              Payment ID:
                            </span>
                            <span className="text-gray-800">
                              {request.paymentId}
                            </span>
                          </div>
                        )}

                      {request.amountPaid > 0 && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm">
                            Amount Paid:
                          </span>
                          <span className="text-gray-800">
                            ${request.amountPaid}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">
                          Request Date:
                        </span>
                        <span className="text-gray-800">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    {request.status === "Pending" && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={() => handleRequestUpdate("Accepted")}
                        >
                          Approve Request
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          onClick={() => handleRequestUpdate("Rejected")}
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
