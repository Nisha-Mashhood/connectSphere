import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../../../Service/Category.Service";
import { createMentorProfile } from "../../../Service/Mentor.Service";

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState([]); // Skills for dropdown
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch skills from the Skill collection
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        console.log("Response data:", data.skills);

        // Save the skills array directly to the state
        setSkills(data.skills);
      } catch (error) {
        toast.error("Failed to fetch skills");
      }
    };
    if (currentUser._id) {
      fetchSkills();
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("Updated skills state:", skills);
  }, [skills]);

  // Handle skill selection
  const handleSkillChange = (skillId) => {
    setSelectedSkills((prevSelectedSkills) => {
      if (prevSelectedSkills.includes(skillId)) {
        return prevSelectedSkills.filter((id) => id !== skillId); // Remove skill if already selected
      } else {
        return [...prevSelectedSkills, skillId]; // Add skill if not already selected
      }
    });
  };

  // Handle certificate upload
  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 2) {
      toast.error("You can only upload a maximum of 2 certificates.");
      setCertificates([]); // Reset state to an empty array
      return;
    }

    setCertificates(files);
  };
 
  const getSkillName = (skillId) => {
    const skill = skills.find((s) => s._id === skillId);
    return skill ? skill.name : '';
  };
  
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const TIME_SLOTS = [
    "09:00 AM - 10:30 AM",
    "10:30 AM - 12:00 PM",
    "01:00 PM - 02:30 PM",
    "02:30 PM - 04:00 PM",
    "04:00 PM - 05:30 PM"
  ];

  const handleAddSlot = () => {
    if (!selectedDay || !selectedTime) {
      toast.error("Please select both day and time");
      return;
    }

    // Check if maximum days limit is reached
    if (!availableSlots.some(slot => slot.day === selectedDay) && availableSlots.length >= 3) {
      toast.error("You can only add up to 3 days");
      return;
    }

    // Check if the slot already exists
    const existingDaySlot = availableSlots.find(slot => slot.day === selectedDay);
    if (existingDaySlot) {
      if (existingDaySlot.timeSlots.includes(selectedTime)) {
        toast.error("This time slot already exists for the selected day");
        return;
      }
      if (existingDaySlot.timeSlots.length >= 2) {
        toast.error("You can only add up to 2 time slots per day");
        return;
      }
    }

    setAvailableSlots(prevSlots => {
      const existingSlot = prevSlots.find(slot => slot.day === selectedDay);
      if (existingSlot) {
        return prevSlots.map(slot =>
          slot.day === selectedDay
            ? { ...slot, timeSlots: [...slot.timeSlots, selectedTime].sort() }
            : slot
        );
      }
      return [...prevSlots, { day: selectedDay, timeSlots: [selectedTime] }]
        .sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
    });

    setSelectedTime("");
  };

  const handleRemoveSlot = (day, time) => {
    setAvailableSlots(prevSlots => {
      const updatedSlots = prevSlots.map(slot => {
        if (slot.day === day) {
          const newTimeSlots = slot.timeSlots.filter(t => t !== time);
          return newTimeSlots.length ? { ...slot, timeSlots: newTimeSlots } : null;
        }
        return slot;
      }).filter(Boolean); // Remove any null entries
      return updatedSlots;
    });
  };


  // Submit Handler with Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validation for specialization
    if (!specialization.trim()) {
      toast.error("Specialization is required.");
      return;
    }
    if (!bio.trim()) {
      toast.error("Bio is required.");
      return;
    }

    if (!price || Number(price) <= 100) {
      toast.error("Price must be greater than ₹100 to cover platform fees.");
      return;
    }

    // Validation for selected skills
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill.");
      return;
    }

    // Validation for certificates
    if (certificates.length === 0) {
      toast.error("Please upload at least one certificate.");
      return;
    }

    // Validation for available slots
    if (availableSlots.length === 0) {
      toast.error("Please add at least one available slot.");
      return;
    }


    // Proceed with form submission if all validations pass

    const formData = new FormData();
    certificates.forEach((file) => formData.append("certificates", file));
    formData.append("userId", currentUser._id);
    formData.append("specialization", specialization);
    formData.append("bio", bio);
    formData.append("price", price);
    formData.append("skills", JSON.stringify(selectedSkills));
    formData.append("availableSlots", JSON.stringify(availableSlots));

    try {
      setLoading(true);
      toast.success("All validations passed. Submitting...");
      await createMentorProfile(formData);
      toast.success("Profile created successfully!");
      // Reset state to initial values
      setSpecialization("");
      setBio("");
      setPrice("");
      setSelectedSkills([]);
      setCertificates([]);
      setAvailableSlots([{ day: "", timeSlots: [""] }]);

      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">
        Create Mentor Profile
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Specialization */}
        <div className="form-group">
          <label className="block font-medium mb-2">Specialization</label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Enter your specialization"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        {/* Bio */}
        <div className="form-group">
          <label className="block font-medium mb-2">
            Bio
            <span className="block text-sm font-normal text-gray-600 mt-1">
              Write a brief introduction about yourself, your experience, and
              what students can expect from your mentorship sessions. This will
              help students understand your teaching style and expertise.
            </span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter your bio"
            className="w-full px-4 py-2 border rounded-md min-h-[120px]"
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="block font-medium mb-2">
            Session Price (in ₹)
            <span className="block text-sm font-normal text-gray-600 mt-1">
              Set your per-hour mentorship fee. Note: ₹100 will be deducted as
              platform fee for each session, so please set your price
              accordingly. For example, if you want to earn ₹900 per session,
              set the price as ₹1000.
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price per hour"
              className="w-full pl-8 pr-4 py-2 border rounded-md"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Your earnings per session: ₹
            {price ? (Number(price) - 100).toString() : "0"}
          </p>
        </div>

        {/* Skills Dropdown */}
        <div className="form-group">
        <label className="block font-medium mb-2">Skills</label>
        <div className="relative">
          {/* Selected Skills Chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSkills.map((skillId) => (
              <div
                key={skillId}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                <span>{getSkillName(skillId)}</span>
                <button
                  type="button"
                  onClick={() => handleSkillChange(skillId)}
                  className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center leading-none font-medium focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-4 py-2 border rounded-md text-left bg-white"
          >
            Select Skills
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border rounded-md shadow-md z-10">
              <ul className="max-h-60 overflow-y-auto">
                {skills.map((skill) => (
                  <li
                    key={skill._id}
                    onClick={() => handleSkillChange(skill._id)}
                    className={`px-4 py-2 cursor-pointer ${
                      selectedSkills.includes(skill._id)
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

        {/* Certificate preview */}
        <div className="form-group">
          <label className="block font-medium mb-2">Certificates</label>
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            multiple
            onChange={handleCertificateUpload}
            className="w-full px-4 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            You can upload a maximum of 2 certificates.
          </p>
          <div className="mt-4">
            {certificates.map((certificate, index) => (
              <div key={index} className="flex items-center gap-4 mb-2">
                <a
                  href={URL.createObjectURL(certificate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Certificate {index + 1}
                </a>
                <p>{certificate.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available Slots Section */}
      <div className="form-group space-y-4">
        <label className="block font-medium mb-2">Available Slots</label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Choose a day</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Choose a time</option>
              {TIME_SLOTS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddSlot}
          className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
        >
          Add Time Slot
        </button>

        {/* Display Selected Slots */}
        {availableSlots.length > 0 && (
          <div className="mt-4 space-y-4">
            {availableSlots.map((slot) => (
              <div key={slot.day} className="p-4 border rounded-md">
                <div className="font-medium text-lg mb-2">{slot.day}</div>
                <div className="flex flex-wrap gap-2">
                  {slot.timeSlots.map((time) => (
                    <div
                      key={`${slot.day}-${time}`}
                      className="inline-flex items-center bg-blue-100 px-3 py-1 rounded-full"
                    >
                      <span className="mr-2">{time}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot.day, time)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 font-bold rounded-md ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-500 text-white"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default MentorProfileForm;
