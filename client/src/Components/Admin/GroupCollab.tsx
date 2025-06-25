import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGroupRequests, groupDetails } from "../../Service/Group.Service";
import { Group, GroupRequest } from "../../types";

const GroupCollab = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("groups");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const groupData = await groupDetails();
        const requestData = await getAllGroupRequests();
        setGroups(groupData.data || []);
        setRequests(requestData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "Accepted") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800"; // Pending
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Group Collaborations</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "groups" 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "requests" 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Requests ({requests.length})
          </button>
        </div>
      </div>

      {activeTab === "groups" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No groups found</p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/admin/group/${group._id}`)}
              >
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${group.coverPic})` }}></div>
                
                <div className="p-5 relative">
                  <img 
                    src={group.profilePic} 
                    alt={group.name} 
                    className="absolute -top-10 left-5 w-16 h-16 rounded-lg object-cover border-4 border-white shadow-md"
                  />
                  
                  <div className="mt-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 font-medium">
                          ${group.price}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{group.bio}</p>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {group.members.length}/{group.maxMembers} members
                      </div>
                      
                      <div className="text-sm font-medium">
                        <span className="text-blue-600 hover:underline">View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No requests found</p>
            </div>
          ) : (
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr 
                      key={request._id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={request.userId.profilePic} alt={request.userId.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.userId.name}</div>
                            <div className="text-sm text-gray-500">{request.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.groupId.name}</div>
                        <div className="text-xs text-gray-500">${request.groupId.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.paymentStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/admin/group-request/${request._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupCollab;