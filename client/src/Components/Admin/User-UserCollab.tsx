import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUserConnections } from "../../Service/User-User.Service";

const UserUserCollab = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getConnections = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllUserConnections();
        setConnections(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getConnections();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "Accepted") return "bg-green-100 text-green-800";
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getConnectionStatus = (conn: string) => {
    if (conn.connectionStatus === "Connected") return "bg-green-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Collaborations</h2>
        <div className="text-sm text-gray-500">{connections.length} connections found</div>
      </div>
      
      {connections.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No connections found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div 
              key={conn._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/admin/user-collab/${conn._id}`)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(conn.requestStatus)}`}>
                    {conn.requestStatus}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Status:</span>
                    <span className={`h-3 w-3 rounded-full ${getConnectionStatus(conn)}`}></span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={conn.requester.profilePic} 
                      alt={conn.requester.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{conn.requester.name}</h3>
                    <p className="text-xs text-gray-500">{conn.requester.jobTitle}</p>
                  </div>
                </div>
                
                <div className="flex justify-center my-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={conn.recipient.profilePic} 
                      alt={conn.recipient.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{conn.recipient.name}</h3>
                    <p className="text-xs text-gray-500">{conn.recipient.jobTitle}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  Requested: {new Date(conn.requestSentAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserUserCollab;