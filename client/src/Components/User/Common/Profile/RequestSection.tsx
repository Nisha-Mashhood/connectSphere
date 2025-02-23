import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getTheRequestByUser,
  getAllRequest,
  acceptTheRequest,
  rejectTheRequest,
  processStripePayment,
} from "../../../../Service/collaboration.Service";
import {
  getRequestStatusColor,
  getRelativeTime,
} from "../../../../lib/helperforprofile";
import toast from "react-hot-toast";
import StripeCheckout from "react-stripe-checkout";
import { RootState } from "../../../../redux/store";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const RequestsSection = ({handleProfileClick}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails,req } = useSelector((state: RootState) => state.profile);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  console.log("req from redux is ",req);

  const fetchRequests = async () => {
    try {
      let receivedRequests = [];
      let sentRequests = [];

      if (currentUser.role === "user") {
        // Get requests sent by the user
        const data = await getTheRequestByUser(currentUser._id);
        setRequests(data.requests);
      } else if (currentUser.role === "mentor" && mentorDetails) {
        // Get requests received by the mentor
        const receivedData = await getAllRequest(mentorDetails._id);
        receivedRequests = receivedData.requests;

        // Get requests sent by the mentor
        const sentData = await getTheRequestByUser(currentUser._id);
        sentRequests = sentData.requests;

        // Combine both received and sent requests
        setRequests([...receivedRequests, ...sentRequests]);
        console.log(requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error.message);
      // toast.error(error.message);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await acceptTheRequest(requestId);
      toast.success("Request Accepted!");
      fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectTheRequest(requestId);
      toast.success("Request Rejected!");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error.message);
    }
  };

  const handlePayment = async (token) => {
    try {
      const response = await processStripePayment({
        token,
        amount: selectedRequest.price * 100,
        requestId: selectedRequest._id,
      });

      if (response.status === "success") {
        toast.success("Payment successful!");
        fetchRequests();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser._id]);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Your Requests (Mentor)
      </h2>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request._id}
            className={`p-4 rounded-lg ${getRequestStatusColor(
              request.isAccepted
            )}`}
            onMouseEnter={() => {
              if (request.isAccepted === "Accepted")
                setSelectedRequest(request);
            }}
            onMouseLeave={() => setSelectedRequest(null)}
          >
            <div className="flex items-center space-x-4">
              <img
                src={
                  currentUser.role === "user"
                    ? request.mentorId?.userId?.profilePic
                    : currentUser._id === request.userId
                    ? request.mentorId?.userId?.profilePic
                    : request.userId?.profilePic
                }
                alt="Mentor"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p
                  className="font-semibold cursor-pointer hover:underline"
                  onClick={() =>
                    currentUser.role === "user"
                      ? handleProfileClick(request.mentorId._id)
                      : handleProfileClick(request.userId?._id)
                  }
                >
                  {currentUser._id === request.userId
                    ? `Requested to Mentor "${request.mentorId?.userId?.name}"`
                    : `Requested by User "${request.userId?.name}"`}
                </p>
                <p className="text-sm">
                  {request.selectedSlot.day} at {request.selectedSlot.timeSlots}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {getRelativeTime(request.createdAt)}
                </p>
              </div>
              {currentUser.role === "user" ? (
                <span
                  className={`${
                    request.isAccepted === "Accepted"
                      ? "text-green-600 dark:text-green-400"
                      : request.isAccepted === "Rejected"
                      ? "text-red-600 dark:text-red-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {request.isAccepted}
                </span>
              ) : (
                <div>
                  {/* If request is sent by the mentor */}
                  {request.userId === currentUser._id ? (
                    <span
                      className={`${
                        request.isAccepted === "Accepted"
                          ? "text-green-600 dark:text-green-400"
                          : request.isAccepted === "Rejected"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {request.isAccepted}
                    </span>
                  ) : (
                    // If the mentor has received the request
                    <div>
                      {request.isAccepted === "Pending" ? (
                        <div className="flex space-x-2">
                          <button
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleAccept(request._id)}
                          >
                            <FaCheckCircle size={20} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleReject(request._id)}
                          >
                            <FaTimesCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-semibold ${
                            request.isAccepted === "Accepted"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {request.isAccepted}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {currentUser.role === "user" &&
              selectedRequest?._id === request._id &&
              request.isAccepted === "Accepted" && (
                <div className="mt-4">
                  <StripeCheckout
                    stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                    token={handlePayment}
                    amount={request.price * 100}
                    name="ConnectSphere Mentorship"
                    description={`Book a slot with ${request.mentorId?.userId?.name}`}
                    email={currentUser.email}
                  ></StripeCheckout>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestsSection;

