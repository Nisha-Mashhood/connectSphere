import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMentorById } from "../../../Service/Mentor.Service";
import Modal from "react-modal";
import { FaTimes, FaCheckCircle, FaStar, FaClock, FaGraduationCap, FaMoneyBillWave } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { SendRequsetToMentor } from "../../../Service/collaboration.Service";
import toast from "react-hot-toast";

const MentorProfile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await fetchMentorById(mentorId);
        setMentor(data.mentor);
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      }
    };
    fetchMentor();
  }, [mentorId]);

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">
          Loading mentor details...
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
      price: mentor.price
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80">
        <div className="absolute inset-0">
          <img
            src={mentor.userId?.coverPic || "/api/placeholder/1200/400"}
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
                    src={mentor.userId?.profilePic || "/api/placeholder/150/150"}
                    alt={mentor.userId?.name}
                    className="mx-auto h-32 w-32 rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {mentor.userId?.name}
                  </h1>
                  <p className="text-xl text-gray-600">{mentor.specialization}</p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                <button
                  onClick={openModal}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Book Session
                </button>
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
                <FaStar className="text-red-500 text-xl"/> 
                </div>
                <p className="text-gray-600">{mentor.bio || "No bio available."}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold mb-4">Expertise</h2>
                <FaGraduationCap className="text-black-500 text-xl"/> 
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
            </div>

            {/* Sidebar */}
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
                  {mentor.availableSlots.map((slot: any, index: number) => (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
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
                  {mentor.availableSlots.map((slot: any, dayIndex: number) =>
                    slot.timeSlots.map((timeSlot: string, slotIndex: number) => (
                      <label
                        key={`${dayIndex}-${slotIndex}`}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="slot"
                          value={`${slot.day} - ${timeSlot}`}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          checked={selectedSlot === `${slot.day} - ${timeSlot}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1">
                          <span className="block font-medium text-gray-900">{slot.day}</span>
                          <span className="block text-sm text-gray-500">{timeSlot}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">Session Price</p>
                <p className="text-2xl font-bold">₹{mentor.price}</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MentorProfile;