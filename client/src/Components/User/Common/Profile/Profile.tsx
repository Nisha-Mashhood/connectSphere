import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../../redux/store";

import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import RequestsSection from "./RequestSection";
import GroupRequests from "./GroupRequests";
import ActiveCollaborations from "./ActiveCollaborations";

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails } = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();

  //   // Navigate to user profile page
  const handleUserProfileClick = (Id: string) => {
    navigate(`/profileDispaly/${Id}`);
  };
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProfileHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProfessionalInfo currentUser={currentUser} />
            <ContactInfo currentUser={currentUser} />
            {currentUser.role === "mentor" && mentorDetails && (
              <MentorDetails mentorDetails={mentorDetails} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RequestsSection handleProfileClick={handleUserProfileClick} />
            <GroupRequests />
            <ActiveCollaborations handleProfileClick={handleUserProfileClick} />
          </div>
        </div>
      </div>

      <CreateGroupButton onCreateGroup={() => navigate("/create-group")} />
    </div>
  );
};

export default Profile;


const ProfileHeader = ({ currentUser }) => {
  return (
    <>
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
    </>
  );
};


const ProfessionalInfo = ({ currentUser }) => {
  return (
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
          <p className="text-gray-500 dark:text-gray-400">Reason for Joining</p>
          <p className="font-semibold dark:text-white">
            {currentUser.reasonForJoining}
          </p>
        </div>
      </div>
    </div>
  );
};


const ContactInfo = ({ currentUser }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Contact Information
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-semibold dark:text-white">{currentUser.email}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Phone</p>
          <p className="font-semibold dark:text-white">{currentUser.phone}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Date of Birth</p>
          <p className="font-semibold dark:text-white">
            {new Date(currentUser.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};


const MentorDetails = ({ mentorDetails }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Your Mentorship Details
      </h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Bio
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{mentorDetails.bio}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Available Slots
        </h3>
        <div className="space-y-3">
          {mentorDetails.availableSlots.map((slot) => (
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
  );
};


const CreateGroupButton = ({ onCreateGroup }) => {
  return (
    <button
      onClick={onCreateGroup}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105"
    >
      <FaUsers className="text-xl" />
      <span className="font-medium">Create Group</span>
    </button>
  );
};
