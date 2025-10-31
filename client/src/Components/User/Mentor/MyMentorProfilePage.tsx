import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { checkMentorProfile } from "../../../Service/Mentor.Service";
import { acceptTheRequest, getAllRequest, rejectTheRequest } from "../../../Service/collaboration.Service";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; 
import toast from "react-hot-toast";
import { Mentor, RequestData } from "../../../redux/types";

const MyMentorProfilePage = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [mentor, setMentor] = useState<Mentor>(null);
  const navigate = useNavigate();

  
  // Fetch mentor profile and requests
  const fetchRequests = useCallback(async () => {
    try {
      const response = await checkMentorProfile(currentUser.id);
      const mentorResponse = response.mentor;
      console.log("Mentor ID:", mentor.id);
      setMentor(mentorResponse);
      console.log("Mentor Details : ",mentor);
      const data = await getAllRequest(mentor.id);
      setRequests(data.requests);
      console.log("Requests:", data);
    } catch (error) {
      toast.error("Error in fetching the Request");
      console.error("Error fetching requests:", error.message);
    }
  },[currentUser,mentor])

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle accept button
  const handleAccept = async (requestId: string) => {
    try {
      await acceptTheRequest(requestId);
      toast.success("Request Accepted!");
      fetchRequests(); // Refresh the requests list
    } catch (error) {
      toast.error("Error in accepting the request")
      console.error("Error accepting the request:", error.message);
    }
  };

  // Handle reject button
  const handleReject = async (requestId: string) => {
    try {
      await rejectTheRequest(requestId);
      toast.success("Request Rejected!");
      fetchRequests(); // Refresh the requests list
    } catch (error) {
      toast.error("Error in Rejecting the request");
      console.error("Error rejecting the request:", error.message);
    }
  };

  // Navigate to user profile page
  const handleUserProfileClick = (userId: string) => {
    navigate(`/userProfile/${userId}`);
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">My Mentor Profile</h1>
      <h2 className="text-xl font-semibold mb-6">Requests</h2>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <img
                  src={request.user.profilePic}
                  alt={request.user.name}
                  className="w-16 h-16 rounded-full object-cover cursor-pointer"
                  onClick={() => handleUserProfileClick(request.userId)}
                />
                <span
                  className="text-lg font-medium cursor-pointer"
                  onClick={() => handleUserProfileClick(request.userId)}
                >
                  {request.user.name}
                </span>
              </div>
              {/* Details Section */}
              <div className="flex flex-col items-end space-y-2">
                <p className="text-sm text-gray-600"><strong>Slot:</strong> {request.selectedSlot.day} - {request.selectedSlot.timeSlots}</p>
                <p className="text-sm text-gray-600"><strong>Price:</strong> ${request.price}</p>
                <div className="flex space-x-4">
                  <button
                    className="text-green-500 hover:text-green-700"
                    onClick={() => handleAccept(request.id)}
                  >
                    <FaCheckCircle size={24} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleReject(request.id)}
                  >
                    <FaTimesCircle size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No requests found.</p>
      )}
    </div>
  );
};

export default MyMentorProfilePage;
