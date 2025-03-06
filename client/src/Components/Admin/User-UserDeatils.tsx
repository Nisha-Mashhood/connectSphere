import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User_UserConnectionsById } from "../../Service/User-User.Service";

const UserUserCollabDetails = () => {
  const { connId } = useParams<{ connId: string }>();
  const [connection, setConnection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getConnectionDetails = async () => {
      setIsLoading(true);
      try {
        const data = await User_UserConnectionsById(connId as string);
        setConnection(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getConnectionDetails();
  }, [connId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Not Found</h2>
          <p className="text-gray-600 mb-6">The requested collaboration details could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === "Accepted") return "bg-green-100 text-green-800 border-green-200";
    if (status === "Pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === "Rejected") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getConnectionStatusColor = (status: string) => {
    if (status === "Connected") return "bg-green-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Collaboration Details</h1>
            <div className="flex items-center">
              <span className="text-sm text-white opacity-90 mr-2">Status:</span>
              <div className={`${getStatusColor(connection.requestStatus)} px-3 py-1 rounded-full text-sm font-medium border`}>
                {connection.requestStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-600">Connection Status: </span>
            <div className="inline-flex items-center">
              <span className={`h-3 w-3 rounded-full ${getConnectionStatusColor(connection.connectionStatus)} mr-2`}></span>
              <span className="font-medium">{connection.connectionStatus}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            ID: <span className="font-mono text-gray-500">{connection._id}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Connection Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Timeline</h3>
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="mb-4 relative">
                <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-blue-500"></div>
                <p className="text-sm font-medium text-gray-800">Request Sent</p>
                <p className="text-xs text-gray-500">{formatDate(connection.requestSentAt)}</p>
              </div>
              
              {connection.updatedAt !== connection.requestSentAt && (
                <div className="mb-4 relative">
                  <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-purple-500"></div>
                  <p className="text-sm font-medium text-gray-800">Last Updated</p>
                  <p className="text-xs text-gray-500">{formatDate(connection.updatedAt)}</p>
                </div>
              )}

              {connection.disconnectionReason && (
                <div className="relative">
                  <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-red-500"></div>
                  <p className="text-sm font-medium text-gray-800">Disconnected</p>
                  <p className="text-xs text-gray-600">Reason: {connection.disconnectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requester Profile */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 p-3 border-b border-gray-200">
                <h3 className="font-semibold text-blue-700">Requester</h3>
              </div>
              
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={connection.requester.profilePic} 
                    alt={connection.requester.name} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{connection.requester.name}</h4>
                    <p className="text-sm text-gray-600">{connection.requester.jobTitle}</p>
                    <p className="text-sm text-gray-500 mt-1">{connection.requester.industry}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Email: </span>
                    <span className="text-gray-800">{connection.requester.email}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Phone: </span>
                    <span className="text-gray-800">{connection.requester.phone}</span>
                  </div>
                  
                  {connection.requester.reasonForJoining && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700">Reason for Joining:</h5>
                      <p className="text-sm text-gray-600 italic">"{connection.requester.reasonForJoining}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recipient Profile */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 p-3 border-b border-gray-200">
                <h3 className="font-semibold text-purple-700">Recipient</h3>
              </div>
              
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={connection.recipient.profilePic} 
                    alt={connection.recipient.name} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{connection.recipient.name}</h4>
                    <p className="text-sm text-gray-600">{connection.recipient.jobTitle}</p>
                    <p className="text-sm text-gray-500 mt-1">{connection.recipient.industry}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Email: </span>
                    <span className="text-gray-800">{connection.recipient.email}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Phone: </span>
                    <span className="text-gray-800">{connection.recipient.phone}</span>
                  </div>
                  
                  {connection.recipient.reasonForJoining && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700">Reason for Joining:</h5>
                      <p className="text-sm text-gray-600 italic">"{connection.recipient.reasonForJoining}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserUserCollabDetails;