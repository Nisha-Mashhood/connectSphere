import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getRequestStatusColor,
  getRelativeTime,
  calculateTimeLeft,
} from "../../../lib/helperforprofile";
import StripeCheckout from "react-stripe-checkout";
import {
  getTheRequestByUser,
  processStripePayment,
  getAllRequest,
  acceptTheRequest,
  rejectTheRequest,
  getCollabDataforMentor,
  getCollabDataforUser,
} from "../../../Service/collaboration.Service";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { checkMentorProfile } from "../../../Service/Mentor.Service";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  console.log(currentUser);
  const [requests, setRequests] = useState<any[]>([]);
  const [mentor, setMentor] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [collabData, setCollabData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      if (currentUser.role === "user") {
        const data = await getTheRequestByUser(currentUser._id);
        setRequests(data.requests);

        const collabDataForUser = await getCollabDataforUser(currentUser._id);
        console.log("collab data", collabDataForUser);
        setCollabData(collabDataForUser);
      } else if (currentUser.role === "mentor") {
        const mentorResponse = await checkMentorProfile(currentUser._id);
        const mentor = mentorResponse.mentor;
        console.log("Mentor ID:", mentor);
        setMentor(mentor);

        const data = await getAllRequest(mentor._id);
        setRequests(data.requests);

        const collabDataForMentor = await getCollabDataforMentor(mentor._id);
        console.log("collab data", collabDataForMentor);
        setCollabData(collabDataForMentor);
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error.message);
    }
  };

  // Handle accept button
  const handleAccept = async (requestId: string) => {
    try {
      await acceptTheRequest(requestId);
      toast.success("Request Accepted!");
      fetchRequests(); // Refresh the requests list
    } catch (error: any) {
      console.error("Error accepting the request:", error.message);
    }
  };

  // Handle reject button
  const handleReject = async (requestId: string) => {
    try {
      await rejectTheRequest(requestId);
      toast.success("Request Rejected!");
      fetchRequests(); // Refresh the requests list
    } catch (error: any) {
      console.error("Error rejecting the request:", error.message);
    }
  };

  // Navigate to user profile page
  const handleUserProfileClick = (Id: string) => {
    navigate(`/profileDispaly/${Id}`);
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
        toast.success("Payment successful!");
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

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Personal Information */}
          <div className="space-y-6">
            {/* Professional Info */}
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

            {/* Contact Information */}
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

            {/* Mentor-specific section */}
            {currentUser.role === "mentor" && mentor && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                  Your Mentorship Details
                </h2>

                {/* Bio Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Bio
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {mentor.bio}
                  </p>
                </div>

                {/* Available Slots Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Available Slots
                  </h3>
                  <div className="space-y-3">
                    {mentor.availableSlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <FaCalendarAlt className="text-blue-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {slot.day}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {slot.timeSlots.map((time, index) => (
                              <span
                                key={index}
                                className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Requests and Collaborations */}
          <div className="space-y-6">
            {/* Requests Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                {currentUser.role === "user"
                  ? "Send Mentorship Requests"
                  : "Received Mentorship Request"}
              </h2>
              {/* [Keep existing requests content] */}
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
                              ? handleUserProfileClick(
                                  request.mentorId._id
                                )
                              : handleUserProfileClick(request.userId?._id)
                          }
                        >
                          {currentUser.role === "user"
                            ? request.mentorId?.userId?.name
                            : request.userId?.name}
                        </p>
                        <p className="text-sm">
                          {request.selectedSlot.day} at{" "}
                          {request.selectedSlot.timeSlots}
                        </p>
                        <p className="text-xs opacity-75 mt-1">
                          {getRelativeTime(request.createdAt)}
                        </p>
                      </div>
                      {currentUser.role === "user" ? (
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
                      ) : (
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

            {/* Active Collaborations Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                Active Collaborations
              </h2>
              {/* [Keep existing collaborations content] */}
              <div className="space-y-4">
                {collabData?.collabData?.map((collab: any) => (
                  <div
                    key={collab._id}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Profile Picture */}
                      <img
                        src={
                          currentUser.role === "user"
                            ? collab.mentorId?.profilePic
                            : collab.userId?.profilePic
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      {/* Collab Details */}
                      <div className="flex-1">
                        {/* Name */}
                        <p className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                          onClick={() =>
                            currentUser.role === "user"
                                ? handleUserProfileClick(collab.mentorId?._id)
                                : handleUserProfileClick(collab.userId?._id)
                                   }
                          >
                          {currentUser.role === "user"
                            ? collab.mentorId?.name
                            : collab.userId?.name}
                        </p>

                        {/* Time Slots */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <span>{collab.selectedSlot[0].day}</span>
                          <span>•</span>
                          <span>
                            {collab.selectedSlot[0].timeSlots.join(", ")}
                          </span>
                        </div>

                        {/* Time Left & Price */}
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <FaClock className="mr-1" />
                            <span>{calculateTimeLeft(collab.endDate)}</span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">
                            ₹{collab.price}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {collab.isCancelled ? "Cancelled" : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              ((new Date().getTime() -
                                new Date(collab.startDate).getTime()) /
                                (new Date(collab.endDate).getTime() -
                                  new Date(collab.startDate).getTime())) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!collabData?.collabData ||
                  collabData.collabData.length === 0) && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No active collaborations found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
