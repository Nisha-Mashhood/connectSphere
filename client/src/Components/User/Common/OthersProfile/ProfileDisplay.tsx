import { useState } from "react";
import Modal from "react-modal";
import { FaTimes, FaStar, FaGraduationCap, FaMoneyBillWave, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { SendRequsetToMentor } from "../../../../Service/collaboration.Service";
import { useProfileData } from "../../../../Hooks/User/useProfileData";
import { ProfileHeader } from "./ProfileHeader";
import { CollaborationSection } from "./CollaborationSection";
import { FeedbackSection } from "./FeedbackSection";
import { Skill } from "../../../../redux/types";
import { Slot } from "../../../../validation/createGroupValidation";

const ProfileDisplay = () => {
  const dispatch = useDispatch();
  const {
    mentor,
    user,
    isMentor,
    collabData,
    hasExistingCollaboration,
    existingRequest,
    feedbacks,
    isSlotLocked,
    userConnections,
    currentUser,
    navigate,
  } = useProfileData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

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
      toast.error("Please select a slot");
      return;
    }
    const [day, timeSlot] = selectedSlot.split(" - ");
    const payload = {
      mentorId: mentor.id,
      userId: currentUser.id,
      selectedSlot: { day: day.trim(), timeSlots: timeSlot.trim() },
      price: mentor.price,
    };
    try {
      await SendRequsetToMentor(payload);
      toast.success("Request sent!");
      closeModal();
    } catch (error) {
      console.log(error)
      toast.error("Failed to send request");
    }
  };

  const handleProfileClick = (id: string) => navigate(`/profileDisplay/${id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-80">
        <div className="absolute inset-0">
          <img
            src={
              isMentor
                ? mentor?.user?.coverPic || "/api/placeholder/1200/400"
                : user?.coverPic || "/api/placeholder/1200/400"
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40">
        <div className="relative">
          {/* Header */}
          <ProfileHeader
            isMentor={isMentor}
            mentor={mentor}
            user={user}
            currentUserId={currentUser?.id}
            profileId={mentor?.id ?? user?.id}
            hasExistingCollaboration={hasExistingCollaboration}
            existingRequest={existingRequest}
            userConnections={userConnections}
            openBookingModal={openModal}
            dispatch={dispatch}
          />

          {/* Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <FaStar className="text-red-500 text-xl" />
                </div>
                <p className="text-gray-600">
                  {isMentor
                    ? mentor?.bio || "No bio available."
                    : user?.reasonForJoining || "No reason provided."}
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
                    {mentor?.skillsDetails?.map((s: Skill) => (
                      <span
                        key={s._id}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {s.name}
                      </span>
                    )) || <p className="text-gray-600">No skills listed.</p>}
                  </div>
                </div>
              )}

              {/* Collaborations – column layout */}
              <CollaborationSection
                collabData={collabData}
                isMentor={isMentor}
                onProfileClick={handleProfileClick}
              />

              {/* Feedback */}
              <FeedbackSection
                feedbacks={feedbacks}
                isMentor={isMentor}
                onProfileClick={handleProfileClick}
              />
            </div>

            {/* Sidebar – only for mentors */}
            {isMentor && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Session Price</h2>
                    <FaMoneyBillWave className="text-green-500 text-xl" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ₹{mentor?.price}
                  </p>
                  <p className="text-sm text-gray-500">per session</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Available Slots</h2>
                    <FaClock className="text-blue-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    {mentor?.availableSlots?.map((slot: Slot, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{slot.day}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {slot.timeSlots.map((t: string, ti: number) => (
                            <span
                              key={ti}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {t}
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
              <h3 className="text-lg font-medium text-gray-900">Select a Time Slot</h3>
              <div className="mt-4 space-y-4">
                {mentor?.availableSlots?.map((slot: Slot, di: number) =>
                  slot.timeSlots.map((time: string, si: number) => {
                    const locked = isSlotLocked(slot.day, time);
                    const value = `${slot.day} - ${time}`;
                    return (
                      <label
                        key={`${di}-${si}`}
                        className={`flex items-center space-x-3 p-3 border rounded-lg ${
                          locked ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="slot"
                          value={value}
                          checked={selectedSlot === value}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          disabled={locked}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`flex-1 ${locked ? "text-gray-500" : "text-gray-800"}`}>
                          {slot.day} - {time}
                          {locked && (
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