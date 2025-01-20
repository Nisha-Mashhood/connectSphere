import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getRequestStatusColor,
  getRelativeTime,
} from "../../../lib/helperforprofile";
import StripeCheckout from "react-stripe-checkout";
import {
  getTheRequestByUser,
  processStripePayment,
} from "../../../Service/collaboration.Service";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const fetchRequests = async () => {
    try {
      const data = await getTheRequestByUser(currentUser._id);
      setRequests(data.requests);
    } catch (error: any) {
      console.error("Error fetching requests:", error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handlePayment = async (token: any) => {
    try {
      const response = await processStripePayment({
        token,
        amount: selectedRequest.price * 100, 
        requestId: selectedRequest._id,
      });

      if (response.status === "success") {
        toast.succes("Payment successful!");
        fetchRequests(); // Refresh requests after payment
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover and Profile Section */}
      <div className="relative w-full">
        <img
          src={currentUser.coverPic || "/api/placeholder/1200/300"}
          alt="Cover"
          className="w-full h-[20rem] object-cover"
        />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <img
            src={currentUser.profilePic || "/api/placeholder/200/200"}
            alt="Profile"
            className="rounded-full w-32 h-32 object-cover ring-4 ring-white dark:ring-gray-800"
          />
        </div>
      </div>

      <div className="mt-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {currentUser.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentUser.jobTitle}
        </p>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - User Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
              Professional Info
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Industry</p>
                <p className="font-semibold dark:text-white">
                  {currentUser.industry}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Reason for Joining
                </p>
                <p className="font-semibold dark:text-white">
                  {currentUser.reasonForJoining}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-semibold dark:text-white">
                  {currentUser.email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-semibold dark:text-white">
                  {currentUser.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Date of Birth
                </p>
                <p className="font-semibold dark:text-white">
                  {new Date(currentUser.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Requests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Mentorship Requests
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
                      request.mentorId?.userId?.profilePic ||
                      "/api/placeholder/40/40"
                    }
                    alt="Mentor"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {request.mentorId?.userId?.name}
                    </p>
                    <p className="text-sm">
                      {request.selectedSlot.day} at{" "}
                      {request.selectedSlot.timeSlots}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      {getRelativeTime(request.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`
                      ${
                        request.isAccepted === "Accepted"
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                      ${
                        request.isAccepted === "Rejected"
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }
                      ${
                        request.isAccepted === "Pending"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : ""
                      }
                    `}
                  >
                    {request.isAccepted}
                  </span>
                </div>
                {selectedRequest?._id === request._id &&
                  request.isAccepted === "Accepted" && (
                    <div className="mt-4">
                      <StripeCheckout
                        stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                        token={handlePayment}
                        amount={request.price * 100}
                        name="ConnectSphere Mentorship"
                        description={`Book a slot with ${request.mentorId?.userId?.name}`}
                        currency="INR"
                      ></StripeCheckout>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
