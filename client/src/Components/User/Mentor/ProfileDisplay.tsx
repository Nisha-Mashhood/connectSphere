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
  FaThumbsUp,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  getCollabDataforMentor,
  getCollabDataforUser,
  getLockedMentorSlot,
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
import { getFeedbackForProfile } from "../../../Service/Feedback.service";
import { Feedback, LockedSlot, Mentor, RequestData, User } from "../../../redux/types";

const ProfileDisplay = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { userConnections } = useSelector((state: RootState) => state.profile);
  const { Id } = useParams();
  const [mentor, setMentor] = useState<Mentor>(null);
  const [user, setUser] = useState<User>(null);
  const [isMentor, setIsMentor] = useState<boolean>(false);
  const [collabData, setCollabData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [hasExistingCollaboration, setHasExistingCollaboration] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RequestData | null>(null);
  const [isCurrentUserMentor, setIsCurrentUserMentor] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [lockedSlots, setLockedSlots] = useState<LockedSlot[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Function to check if user is a mentor
  const checkIfUserIsMentor = async (id : string) => {
    try {
      const mentorData = await fetchMentorById(id);
      return !!(mentorData && mentorData.mentor);
    } catch (error) {
      if (error.message === "Mentor not found") {
        return false;
      }
      console.error("Error checking mentor status:", error);
      return false;
    }
  };

  // Check for existing requests
  const fetchExistingRequest = async () => {
    try {
      const response = await getTheRequestByUser(currentUser.id);
      console.log('Fetched Existing requset : ',response);
      const filteredRequest = response.requests.find(
        (req) => req.mentorId === Id
      );
      setExistingRequest(filteredRequest || null);
    } catch (error) {
      console.error("Error fetching existing requests:", error);
    }
  };

  // Check for any existing collaborations
  const checkExistingCollaboration = (collabData) => {
    if (!collabData?.collabData || !currentUser) return false;

    console.log("collab Data :",collabData);
    return collabData.collabData.some((collab) => {
      if (isMentor) {
        if (isCurrentUserMentor) {
          return collab.mentorId?._id === mentor.id;
        } else {
          return collab.userId?._id === currentUser.id;
        }
      } else {
        if (isCurrentUserMentor) {
          return collab.mentorId?._id === currentUser.id;
        } else {
          return collab.userId?._id === currentUser.id;
        }
      }
    });
  };

  const toggleExpandedFeedback = (feedbackId) => {
    if (expandedFeedback === feedbackId) {
      setExpandedFeedback(null);
    } else {
      setExpandedFeedback(feedbackId);
    }
  };

  // Fetch feedback for the profile
  const fetchFeedback = async (profileType: "mentor" | "user") => {
    try {
      const feedbackData = await getFeedbackForProfile(Id, profileType);
      console.log(`Feedback data for ${profileType}:`, feedbackData);
      setFeedbacks(feedbackData.feedbacks || []);
    } catch (error) {
      console.error(`Error fetching ${profileType} feedback:`, error);
      toast.error("Failed to load feedback");
      setFeedbacks([]);
    }
  };

  // Fetch locked slots for mentor
  const fetchLockedSlots = async (mentorId: string) => {
    try {
      const response = await getLockedMentorSlot(mentorId);
      console.log("Locked slots:", response);
      setLockedSlots(response.lockedSlots || []);
    } catch (error) {
      console.error("Error fetching locked slots:", error);
      toast.error("Failed to load locked slots");
      setLockedSlots([]);
    }
  };

  // Check if a slot is locked
  const isSlotLocked = (day: string, timeSlot: string) => {
    const startTimeMatch = timeSlot.match(/^(\d{1,2}:\d{2}\s[AP]M)/);
    const startTime = startTimeMatch ? startTimeMatch[1] : timeSlot;

    const normalizedDay = day.trim().toLowerCase();
    const normalizedStartTime = startTime.trim().toLowerCase();

    const isLocked = lockedSlots.some((locked) => {
      const lockedDay = locked.day.trim().toLowerCase();
      const hasTimeSlot = locked.timeSlots.some(
        (t: string) => t.trim().toLowerCase() === normalizedStartTime
      );
      return lockedDay === normalizedDay && hasTimeSlot;
    });

    return isLocked;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id || !Id) {
        console.error("Missing currentUser.id or Id");
        toast.error("Invalid user or profile ID");
        return;
      }

      try {
        // Check if current user is a mentor
        const isCurrentUserMentorStatus = await checkIfUserIsMentor(currentUser.id);
        setIsCurrentUserMentor(isCurrentUserMentorStatus);

        // Check if profile ID is a mentor
        const isProfileMentor = await checkIfUserIsMentor(Id);
        setIsMentor(isProfileMentor);

        if (isProfileMentor) {
          // Fetch mentor details
          try {
            const mentorData = await fetchMentorById(Id);
            console.log("Mentor data:", mentorData);
            if (mentorData?.mentor) {
              setMentor(mentorData.mentor);

              // Fetch mentor-specific data in parallel
              await Promise.all([
                getCollabDataforMentor(Id)
                  .then((collabResponse) => {
                    console.log("Mentor collab data:", collabResponse);
                    setCollabData(collabResponse);
                    setHasExistingCollaboration(checkExistingCollaboration(collabResponse));
                  })
                  .catch((err) => {
                    console.error("Error fetching mentor collab data:", err);
                    setCollabData({ collabData: [] });
                  }),
                fetchLockedSlots(Id),
                fetchFeedback("mentor"),
              ]);
            } else {
              console.error("No mentor data found in response");
              toast.error("Failed to load mentor data");
            }
          } catch (error) {
            console.error("Error fetching mentor details:", error);
            toast.error("Failed to load mentor profile");
          }
        } else {
          // Fetch user details
          try {
            const userData = await fetchUserDetails(Id);
            console.log("User data:", userData);
            if (userData?.user) {
              setUser(userData.user);
            } else {
              console.error("No user data found in response");
              toast.error("Failed to load user data");
              return;
            }

            // Fetch user-specific data in parallel
            await Promise.all([
              getCollabDataforUser(Id)
                .then((collabResponse) => {
                  console.log("User collab data:", collabResponse);
                  setCollabData(collabResponse);
                  setHasExistingCollaboration(checkExistingCollaboration(collabResponse));
                })
                .catch((err) => {
                  console.error("Error fetching user collab data:", err);
                  setCollabData({ collabData: [] });
                }),
              fetchFeedback("user"),
            ]);
          } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to load user profile");
          }
        }

        // Fetch existing requests and connections
        try {
          await fetchExistingRequest();
          dispatch(fetchUserConnections(currentUser.id));
        } catch (error) {
          console.error("Error fetching requests/connections:", error);
        }
      } catch (error) {
        console.error("Unexpected error in fetchData:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchData();
  }, [Id, currentUser?._id, dispatch]);

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
      mentorId: mentor.id,
      userId: currentUser.id,
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
    } catch (error) {
      console.error("Error sending request:", error.message);
      toast.error("Failed to send the request. Please try again.");
    }
  };

  const handleConnect = async () => {
    try {
      const newConnection = await sendUser_UserRequset(currentUser._id, Id);
      if (newConnection) {
        toast.success("Connection Request sent successfully");
        dispatch(fetchUserConnections(currentUser._id));
      }
    } catch (error) {
      console.error("Error sending user request:", error);
      toast.error("Failed to send connection request");
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      const response = await respondToUser_UserRequest(requestId, action);
      if (response) {
        toast.success(`Request ${action} successfully`);
        dispatch(fetchUserConnections(currentUser._id));
      }
    } catch (error) {
      console.error(`Error responding to request (${action}):`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleUserProfileClick = (userId: string) => {
    navigate(`/profileDisplay/${userId}`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-1">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80">
        <div className="absolute inset-0">
          <img
            src={
              isMentor
                ? mentor.user?.coverPic || "/api/placeholder/1200/400"
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
                        ? mentor.user?.profilePic || "/api/placeholder/1200/400"
                        : user.profilePic || "/api/placeholder/1200/400"
                    }
                    alt={isMentor ? mentor.user?.name : user.name}
                    className="mx-auto h-32 w-32 rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isMentor ? mentor.user?.name : user.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    {isMentor ? mentor.specialization : user.jobTitle}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                {currentUser?._id === Id ? (
                  <p className="text-gray-500 font-semibold">This is your profile</p>
                ) : !mentor ? (
                  <div>
                    {userConnections?.received?.find(
                      (req) => req.requester.id === Id && req.requestStatus === "Pending"
                    ) ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRequestResponse(
                              userConnections.received.find(
                                (req) => req.requester.id === Id && req.requestStatus === "Pending"
                              ).id,
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
                                (req) => req.requester.id === Id && req.requestStatus === "Pending"
                              ).id,
                              "Rejected"
                            )
                          }
                          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center gap-1"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    ) : userConnections?.sent?.find(
                        (req) => req.recipient?.id === Id && req.requestStatus === "Pending"
                      ) ? (
                      <button
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md"
                        disabled
                      >
                        Request Sent
                      </button>
                    ) : userConnections?.sent?.find(
                        (req) =>
                          req.recipient?.id === Id &&
                          (req.connectionStatus === "Connected" || req.requestStatus === "Accepted")
                      ) ||
                      userConnections?.received?.find(
                        (req) =>
                          req.requester.id === Id &&
                          (req.connectionStatus === "Connected" || req.requestStatus === "Accepted")
                      ) ? (
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                        disabled
                      >
                        Connected
                      </button>
                    ) : userConnections?.sent?.find(
                        (req) => req.recipient?.id === Id && req.requestStatus === "Rejected"
                      ) ? (
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={handleConnect}
                      >
                        Request Again
                      </button>
                    ) : (
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={handleConnect}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ) : hasExistingCollaboration ? (
                  <p className="text-green-600 font-semibold">✅ Already in Collaboration</p>
                ) : existingRequest ? (
                  <p
                    className={`font-semibold ${
                      existingRequest.isAccepted === "Pending" ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {existingRequest.isAccepted === "Pending" ? "⏳ Request Pending" : "✔️ Request Approved"}
                  </p>
                ) : (
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
                  {isMentor ? mentor.bio || "No bio available." : user.reasonForJoining || "No reason provided."}
                </p>
              </div>

              {/* Skills */}
              {isMentor && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-4">Expertise</h2>
                    <FaGraduationCap className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skillsDetails?.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill.name}
                      </span>
                    )) || <p className="text-gray-600">No skills listed.</p>}
                  </div>
                </div>
              )}

              {/* Collaboration Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold mb-4">Collaboration</h2>
                  <FaUsers className="text-green-500 text-xl" />
                </div>
                {collabData?.collabData?.length > 0 ? (
                  <div className="space-y-4">
                    {collabData.collabData.map((collab, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={
                            isMentor
                              ? collab.userId?.profilePic || "/api/placeholder/150/150"
                              : collab.mentorId?.userId?.profilePic || "/api/placeholder/150/150"
                          }
                          alt={isMentor ? collab.userId?.name : collab.mentorId?.userId?.name}
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
                            {isMentor ? collab.userId?.name : collab.mentorId?.userId?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isMentor ? collab.userId?.email : collab.mentorId?.specialization}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No collaboration yet.</p>
                )}
              </div>

              {/* Feedback Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Feedback & Reviews</h2>
                  <FaStar className="text-yellow-500 text-xl" />
                </div>
                {feedbacks.length > 0 ? (
                  <div className="space-y-6">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                feedback.givenBy === "user"
                                  ? feedback.user?.profilePic || "/api/placeholder/150/150"
                                  : feedback.mentor?.user?.profilePic || "/api/placeholder/150/150"
                              }
                              alt={feedback.givenBy === "user" ? feedback.user?.name : feedback.mentor?.user?.name}
                              className="h-14 w-14 rounded-full border-2 border-white shadow-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <p
                                  className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() =>
                                    handleUserProfileClick(
                                      feedback.givenBy === "user" ? feedback.user.id : feedback.mentor?.user?.id
                                    )
                                  }
                                >
                                  {feedback.givenBy === "user" ? feedback.user?.name : feedback.mentor?.user?.name}
                                  <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {feedback.givenBy === "user" ? (
                                      <FaUser className="mr-1 text-xs" />
                                    ) : (
                                      <FaGraduationCap className="mr-1 text-xs" />
                                    )}
                                    {feedback.givenBy}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="hidden md:flex">{renderStars(feedback.rating)}</div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <FaCalendarAlt className="mr-1" />
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="md:hidden mt-2">{renderStars(feedback.rating)}</div>
                            <p className="mt-3 text-gray-700">{feedback.comments}</p>
                            <div
                              className="mt-4 pt-3 border-t border-gray-200 cursor-pointer"
                              onClick={() => toggleExpandedFeedback(feedback.id)}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-600">
                                  {expandedFeedback === feedback.id ? "Hide details" : "Show rating details"}
                                </p>
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">
                                    {feedback.wouldRecommend ? (
                                      <span className="text-green-600 flex items-center">
                                        <FaThumbsUp className="mr-1" /> Would recommend
                                      </span>
                                    ) : (
                                      <span className="text-red-600">Would not recommend</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              {expandedFeedback === feedback.id && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Communication</p>
                                    {renderStars(feedback.communication)}
                                  </div>
                                  <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">{isMentor ? "Expertise" : "Engagement"}</p>
                                    {renderStars(feedback.expertise)}
                                  </div>
                                  <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Punctuality</p>
                                    {renderStars(feedback.punctuality)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <FaStar className="mx-auto text-gray-300 text-4xl mb-3" />
                    <p className="text-gray-600">No feedback available yet.</p>
                  </div>
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
                  <p className="mt-2 text-3xl font-bold text-gray-900">₹{mentor.price}</p>
                  <p className="text-sm text-gray-500">per session</p>
                </div>

                {/* Available Slots */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Available Slots</h2>
                    <FaClock className="text-blue-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    {mentor.availableSlots?.map((slot, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{slot.day}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {slot.timeSlots.map((time: string, timeIndex: number) => (
                            <span
                              key={timeIndex}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    )) || <p className="text-gray-600">No slots available.</p>}
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
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Select a Time Slot</h3>
                  <div className="mt-4 space-y-4">
                    {mentor.availableSlots?.map((slot, dayIndex) =>
                      slot.timeSlots.map((timeSlot: string, slotIndex: number) => {
                        const isLocked = isSlotLocked(slot.day, timeSlot);
                        return (
                          <label
                            key={`${dayIndex}-${slotIndex}`}
                            className={`flex items-center space-x-3 p-3 border rounded-lg ${
                              isLocked ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <input
                              type="radio"
                              name="slot"
                              value={`${slot.day} - ${timeSlot}`}
                              onChange={(e) => setSelectedSlot(e.target.value)}
                              checked={selectedSlot === `${slot.day} - ${timeSlot}`}
                              disabled={isLocked}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`flex-1 ${isLocked ? "text-gray-500" : "text-gray-800"}`}>
                              {slot.day} - {timeSlot}
                              {isLocked && (
                                <span className="ml-2 text-xs text-red-600 lowercase">
                                  already locked by another user
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })
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