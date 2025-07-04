import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserToMentorCollab,
  UserToMentorRequset,
} from "../../Service/collaboration.Service";
import { Collaboration, MentorRequest } from "../../types";

const UserMentorCollab = () => {
  const [userToMentorRequests, setUserToMentorRequests] = useState<
    MentorRequest[]
  >([]);
  const [userToMentorCollab, setUserToMentorCollab] = useState<Collaboration[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("collaborations");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [collabPage, setCollabPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);
  const [collabTotalPages, setCollabTotalPages] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    console.log("Fetching data with searchTerm:", searchTerm);
    try {
      const [requestsData, collabData] = await Promise.all([
        UserToMentorRequset(requestPage, itemsPerPage, searchTerm),
        UserToMentorCollab(collabPage, itemsPerPage, searchTerm),
      ]);
      console.log("Requests Data:", requestsData);
      console.log("Collab Data:", collabData);

      setUserToMentorRequests(requestsData?.requests || []);
      setUserToMentorCollab(collabData?.collabs || []);
      setRequestTotalPages(requestsData?.pages || 1);
      setCollabTotalPages(collabData?.pages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [requestPage, collabPage, searchTerm]);

  // Debounce search to prevent rapid API calls
  useEffect(() => {
    const debounce = setTimeout(() => {
      setRequestPage(1);
      setCollabPage(1);
      fetchData();
    }, 300); // 300ms delay

    return () => clearTimeout(debounce); // Cleanup
  }, [fetchData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (
    status,
    endDate = null,
    isCancelled = false,
    isAccepted = null
  ) => {
    // Check if collaboration is cancelled
    if (isCancelled) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Deactive
        </span>
      );
    }

    // Check if request is rejected
    if (isAccepted === "Rejected") {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Deactive
        </span>
      );
    }

    // Check if collaboration is completed based on endDate
    const isCompleted = endDate && new Date(endDate) < new Date();
    if (isCompleted) {
      return (
        <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
          Collaboration Completed
        </span>
      );
    }

    if (status === "Accepted" || status === true) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Active
        </span>
      );
    } else if (status === "Pending" || status === false) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {status}
        </span>
      );
    }
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-4 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        User-Mentor Relationship Management
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "collaborations"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("collaborations")}
        >
          Active Collaborations ({userToMentorCollab.length})
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "requests"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Mentorship Requests ({userToMentorRequests.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === "collaborations" && (
            <div>
              <div className="overflow-x-auto">
                {userToMentorCollab.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mentor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mentee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userToMentorCollab.map((collab) => (
                        <tr
                          key={collab._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/admin/collaboration/${collab._id}`)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    collab.mentorId?.userId?.profilePic ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={collab.mentorId?.userId?.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {collab.mentorId?.userId?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {collab.mentorId?.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    collab.userId?.profilePic ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={collab.userId?.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {collab.userId?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {collab.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {collab.mentorId?.specialization}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${collab.price}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(collab.startDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {formatDate(collab.endDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(
                              collab.payment,
                              collab.endDate,
                              collab.isCancelled
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No active collaborations found
                  </div>
                )}
              </div>
              <Pagination
                currentPage={collabPage}
                totalPages={collabTotalPages}
                onPageChange={setCollabPage}
              />
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <div className="overflow-x-auto">
                {userToMentorRequests.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mentee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested Mentor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userToMentorRequests.map((request) => (
                        <tr
                          key={request._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/admin/request/${request._id}`)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    request.userId?.profilePic ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={request.userId?.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.userId?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    request.mentorId?.userId?.profilePic ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={request.mentorId?.userId?.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.mentorId?.userId?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.mentorId?.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.mentorId?.specialization}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.selectedSlot?.day}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.selectedSlot?.timeSlots}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${request.price}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.isAccepted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(request.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No mentorship requests found
                  </div>
                )}
              </div>
              <Pagination
                currentPage={requestPage}
                totalPages={requestTotalPages}
                onPageChange={setRequestPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserMentorCollab;
