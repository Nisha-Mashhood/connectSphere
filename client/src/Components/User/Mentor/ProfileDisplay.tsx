import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMentorById } from "../../../Service/Mentor.Service";
import Modal from "react-modal";
import {
  FaTimes,
  FaUsers,
  FaStar,
  FaClock,
  FaGraduationCap,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  getCollabDataforMentor,
  getCollabDataforUser,
  getTheRequestByUser,
  SendRequsetToMentor,
} from "../../../Service/collaboration.Service";
import toast from "react-hot-toast";
import { fetchUserDetails } from "../../../Service/User.Service";
import {
  respondToUser_UserRequest,
  sendUser_UserRequset,
} from "../../../Service/User-User.Service";
import { fetchUserConnections } from "../../../redux/Slice/profileSlice";

const ProfileDisplay = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { userConnections } = useSelector((state: RootState) => state.profile);
  const { Id } = useParams(); // mentorId
  const [mentor, setMentor] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMentor, setIsMentor] = useState<boolean>(true);
  const [collabData, setCollabData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [hasExistingCollaboration, setHasExistingCollaboration] =
    useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isCurrentUserMentor, setIsCurrentUserMentor] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  //function to check if user is a mentor
  const checkIfUserIsMentor = async (userId: string) => {
    try {
      const mentorData = await fetchMentorById(userId);
      return !!(mentorData && mentorData.mentor);
    } catch (error) {
      console.error("Error checking mentor status:", error);
      return false;
    }
  };

  //Check for existing requsets
  const fetchExistingRequest = async () => {
    try {
      const response = await getTheRequestByUser(currentUser._id);
      console.log(response);
      const filteredRequest = response.requests.find(
        (req: any) => req.mentorId._id === Id
      );

      setExistingRequest(filteredRequest || null);
    } catch (error) {
      console.error("Error fetching existing requests:", error);
    }
  };

  //for for any existing collaborations
  const checkExistingCollaboration = (collabData: any) => {
    if (!collabData?.collabData || !currentUser) return false;

    return collabData.collabData.some((collab: any) => {
      if (isMentor) {
        // If viewing mentor profile
        if (isCurrentUserMentor) {
          // Current user is a mentor, check mentor ID
          return collab.mentorId?._id === mentor._id;
        } else {
          // Current user is regular user, check user ID
          return collab.userId?._id === currentUser._id;
        }
      } else {
        // If viewing user profile
        if (isCurrentUserMentor) {
          // Current user is a mentor, check mentor ID
          return collab.mentorId?._id === currentUser._id;
        } else {
          // Current user is regular user, check user ID
          return collab.userId?._id === currentUser._id;
        }
      }
    });
  };

  useEffect(() => {
    const fetchdata = async () => {
      if (!currentUser?._id) return;

      console.log(currentUser._id);
      console.log(Id);

      try {
        // First check if current user is a mentor
        const isMentor = await checkIfUserIsMentor(currentUser._id);
        setIsCurrentUserMentor(isMentor);

        //console.log("fetching mentor details");
        const mentorData = await fetchMentorById(Id);
        //console.log(mentorData);
        if (mentorData && mentorData.mentor) {
          setMentor(mentorData.mentor);
          setIsMentor(true);

          const collabDataForMentor = await getCollabDataforMentor(Id);
          //console.log("isMentor", isMentor);
          //console.log("collab data", collabDataForMentor);
          setCollabData(collabDataForMentor);
          setHasExistingCollaboration(
            checkExistingCollaboration(collabDataForMentor)
          );
        } else {
          //console.log("No mentor details found. Fetching user details...");
          const userData = await fetchUserDetails(Id);
          //console.log(userData);
          setUser(userData);
          setIsMentor(false);

          const collabDataForUser = await getCollabDataforUser(Id);
          //console.log("isMentor", isMentor);
          //console.log("collab data", collabDataForUser);
          setCollabData(collabDataForUser);
          setHasExistingCollaboration(
            checkExistingCollaboration(collabDataForUser)
          );
        }

        // Fetch existing requests
        fetchExistingRequest();
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchdata();
    //fetch user connections
    dispatch(fetchUserConnections(currentUser._id));
  }, [Id, currentUser?._id]);

  console.log("existingRequest :", existingRequest);

  if (!mentor && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">
          Loading profile details...
        </div>
      </div>
    );
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleRequest = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot before sending a request.");
      return;
    }
    const [day, timeSlot] = selectedSlot.split(" - ");
    const requestData = {
      mentorId: mentor._id,
      userId: currentUser._id,
      selectedSlot: {
        day: day.trim(),
        timeSlots: timeSlot.trim(),
      },
      price: mentor.price,
    };

    try {
      await SendRequsetToMentor(requestData);
      toast.success("Request sent successfully!");
      closeModal();
    } catch (error: any) {
      console.error("Error sending request:", error.message);
      toast.error("Failed to send the request. Please try again.");
    }
  };

  const handleConnect = async () => {
    try {
      console.log(`Sending request to user ${Id}`);
      const newConnection = await sendUser_UserRequset(currentUser._id, Id);
      if (newConnection) {
        toast.success("Connection Requset send successfully");
        dispatch(fetchUserConnections(currentUser._id));
      }
    } catch (error) {
      console.error("Error sending user request:", error);
    }
  };
  console.log("User connections :", userConnections);

  const handleRequestResponse = async (requestId, action) => {
    try {
      const response = await respondToUser_UserRequest(requestId, action);
      if (response) {
        toast.success(`Request ${action} successfully`);
        dispatch(fetchUserConnections(currentUser._id));
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${action} request`);
    }
  };

  // Navigate to user profile page
  const handleUserProfileClick = (Id: string) => {
    navigate(`/profileDispaly/${Id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80">
        <div className="absolute inset-0">
          <img
            src={
              isMentor
                ? mentor.userId?.coverPic || "/api/placeholder/1200/400"
                : user.coverPic || "/api/placeholder/1200/400"
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40">
        <div className="relative">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:space-x-5">
                <div className="flex-shrink-0">
                  <img
                    src={
                      isMentor
                        ? mentor.userId?.profilePic ||
                          "/api/placeholder/1200/400"
                        : user.profilePic || "/api/placeholder/1200/400"
                    }
                    alt={isMentor ? mentor.userId?.name : user.name}
                    className="mx-auto h-32 w-32 rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isMentor ? mentor.userId?.name : user.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    {isMentor ? mentor.specialization : user.jobTitle}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                {currentUser?._id === Id ? (
                  // If the logged-in user is viewing their own profile
                  <p className="text-gray-500 font-semibold">
                    This is your profile
                  </p>
                ) : !mentor ? (
                  // If viewing another user's profile (not a mentor)
                  <div>
                    {userConnections?.received?.find(
                      (req) =>
                        req.requester === Id && req.requestStatus === "Pending"
                    ) ? (
                      // Show accept/reject buttons for pending received requests
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRequestResponse(
                              userConnections.received.find(
                                (req) =>
                                  req.requester === Id &&
                                  req.requestStatus === "Pending"
                              )._id,
                              "Accepted"
                            )
                          }
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center gap-1"
                        >
                          <FaCheckCircle /> Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRequestResponse(
                              userConnections.received.find(
                                (req) =>
                                  req.requester === Id &&
                                  req.requestStatus === "Pending"
                              )._id,
                              "Rejected"
                            )
                          }
                          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center gap-1"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    ) : userConnections?.sent?.find(
                        (req) =>
                          req.recipient?._id === Id &&
                          req.requestStatus === "Pending"
                      ) ? (
                      // Request sent but pending
                      <button
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md"
                        disabled
                      >
                        Request Sent
                      </button>
                    ) : userConnections?.sent?.find(
                        (req) =>
                          req.recipient?._id === Id &&
                          (req.connectionStatus === "Connected" ||
                            req.requestStatus === "Accepted")
                      ) ||
                      userConnections?.received?.find(
                        (req) =>
                          req.requester === Id &&
                          (req.connectionStatus === "Connected" ||
                            req.requestStatus === "Accepted")
                      ) ? (
                      // Already connected
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                        disabled
                      >
                        Connected
                      </button>
                    ) : userConnections?.sent?.find(
                        (req) =>
                          req.recipient?._id === Id &&
                          req.requestStatus === "Rejected"
                      ) ? (
                      // Request was rejected
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={handleConnect}
                      >
                        Request Again
                      </button>
                    ) : (
                      // No connection yet, show connect button
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={handleConnect}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ) : hasExistingCollaboration ? (
                  // If the logged-in user is already in collaboration
                  <p className="text-green-600 font-semibold">
                    ✅ Already in Collaboration
                  </p>
                ) : existingRequest ? (
                  // If a request is already sent
                  <p
                    className={`font-semibold ${
                      existingRequest.isAccepted === "Pending"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {existingRequest.isAccepted === "Pending"
                      ? "⏳ Request Pending"
                      : "✔️ Request Approved"}
                  </p>
                ) : (
                  // If no request is sent and no collaboration exists, show "Send Request" button
                  <button
                    onClick={openModal}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Book Session
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <FaStar className="text-red-500 text-xl" />
                </div>
                <p className="text-gray-600">
                  {isMentor
                    ? mentor.bio || "No bio available."
                    : user.reasonForJoining}
                </p>
              </div>

              {/* Skills */}
              {isMentor && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-4">Expertise</h2>
                    <FaGraduationCap className="text-black-500 text-xl" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills?.map((skill: any) => (
                      <span
                        key={skill._id}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaboration Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold mb-4">Collaboration</h2>
                  <FaUsers className="text-green-500 text-xl" />
                </div>

                {collabData &&
                collabData.collabData &&
                collabData.collabData.length > 0 ? (
                  <div className="space-y-4">
                    {collabData.collabData.map((collab, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={
                            isMentor
                              ? collab.userId?.profilePic ||
                                "/api/placeholder/150/150"
                              : collab.mentorId?.userId?.profilePic ||
                                "/api/placeholder/150/150"
                          }
                          alt={
                            isMentor
                              ? collab.userId?.name
                              : collab.mentorId?.userId?.name
                          }
                          className="h-12 w-12 rounded-full border-2 border-gray-200"
                        />
                        <div>
                          <p
                            className="font-medium text-gray-900 cursor-pointer hover:underline"
                            onClick={() =>
                              isMentor
                                ? handleUserProfileClick(collab.userId._id)
                                : handleUserProfileClick(collab.mentorId._id)
                            }
                          >
                            {isMentor
                              ? collab.userId?.name
                              : collab.mentorId?.userId?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isMentor
                              ? collab.userId?.email
                              : collab.mentorId?.specialization}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No collaboration yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            {isMentor && (
              <div className="space-y-6">
                {/* Price Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Session Price</h2>
                    <FaMoneyBillWave className="text-green-500 text-xl" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ₹{mentor.price}
                  </p>
                  <p className="text-sm text-gray-500">per session</p>
                </div>

                {/* Available Slots */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Available Slots</h2>
                    <FaClock className="text-blue-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    {mentor.availableSlots.map((slot: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{slot.day}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {slot.timeSlots.map(
                            (time: string, timeIndex: number) => (
                              <span
                                key={timeIndex}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {time}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isMentor && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Book Session"
          className="max-w-2xl mx-auto mt-20 bg-white rounded-xl shadow-xl p-6"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Book Session</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Select a Time Slot
                  </h3>
                  <div className="mt-4 space-y-4">
                    {mentor.availableSlots.map((slot: any, dayIndex: number) =>
                      slot.timeSlots.map(
                        (timeSlot: string, slotIndex: number) => (
                          <label
                            key={`${dayIndex}-${slotIndex}`}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="slot"
                              value={`${slot.day} - ${timeSlot}`}
                              onChange={(e) => setSelectedSlot(e.target.value)}
                              checked={
                                selectedSlot === `${slot.day} - ${timeSlot}`
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="flex-1 text-gray-800">
                              {slot.day} - {timeSlot}
                            </span>
                          </label>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequest}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
              >
                Send Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfileDisplay;
