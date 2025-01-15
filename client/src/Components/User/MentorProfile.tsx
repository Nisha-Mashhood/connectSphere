import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../../Service/Category.Service";
import { createMentorProfile } from "../../Service/Mentor.Service";

const MentorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState([]); // Skills for dropdown
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([
    { day: "", timeSlots: [""] },
  ]);
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
  // Handle day input
  const handleDayChange = (index, value) => {
    const updatedSlots = [...availableSlots];
    updatedSlots[index].day = value;
    setAvailableSlots(updatedSlots);
  };

  // Handle time slot input
  const handleTimeSlotChange = (dayIndex, timeIndex, value) => {
    const updatedSlots = [...availableSlots];
    updatedSlots[dayIndex].timeSlots[timeIndex] = value;
    setAvailableSlots(updatedSlots);
  };

  // Add a new time slot for a day
  const addTimeSlot = (dayIndex) => {
    const day = availableSlots[dayIndex];
    if (day.timeSlots.length >= 2) {
      toast.error("You can only add up to 2 time slots per day.");
      return;
    }

    setAvailableSlots((prevSlots) => {
      const updatedSlots = [...prevSlots];
      updatedSlots[dayIndex].timeSlots.push("");
      return updatedSlots;
    });
  };

  // Add a new day
  const addDay = () => {
    if (availableSlots.length >= 3) {
      toast.error("You can only add up to 3 days.");
      return;
    }

    setAvailableSlots((prevSlots) => [
      ...prevSlots,
      { day: "", timeSlots: [""] },
    ]);
  };

  // Remove a specific day
  const removeDay = (index) => {
    const updatedSlots = availableSlots.filter((_, i) => i !== index);
    setAvailableSlots(updatedSlots);
  };

  // Remove a specific time slot for a day
  const removeTimeSlot = (dayIndex, timeIndex) => {
    const updatedSlots = [...availableSlots];
    updatedSlots[dayIndex].timeSlots = updatedSlots[dayIndex].timeSlots.filter(
      (_, i) => i !== timeIndex
    );
    setAvailableSlots(updatedSlots);
  };

  const validateSlot = (slot) => {
    // Days of the week for validation (case-insensitive)
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
  
    // Check if day is valid (case-insensitive)
    if (!validDays.includes(slot.day.toLowerCase())) {
      toast.error(
        `Invalid day entered: "${slot.day}". Please enter a valid day of the week (e.g., Monday, Tuesday).`
      );
      return false;
    }
  
    // Regular expression for time slot format (e.g., "09:00 AM - 10:30 AM")
    const timeSlotRegex = /^([0-9]{1,2}:[0-9]{2} (AM|PM)) - ([0-9]{1,2}:[0-9]{2} (AM|PM))$/i;
  
    // Validate each time slot for the day
    for (let timeSlot of slot.timeSlots) {
      if (!timeSlotRegex.test(timeSlot)) {
        toast.error(
          `Invalid time slot format: "${timeSlot}". Please use the format "hh:mm AM/PM - hh:mm AM/PM".`
        );
        return false;
      }
  
      // Check if duration is within the 1.5-hour limit
      const [start, end] = timeSlot.split(" - ");
      const startTime = new Date(`1970-01-01T${convertTo24Hour(start)}`);
      const endTime = new Date(`1970-01-01T${convertTo24Hour(end)}`);
      const diffInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
      if (diffInMinutes > 90) {
        toast.error(
          `Time slot duration for ${slot.day} exceeds 1.5 hours. Please adjust the time slot "${timeSlot}".`
        );
        return false;
      }
    }
  
    return true;
  };
  
  // Helper function to convert "hh:mm AM/PM" to 24-hour format
  const convertTo24Hour = (time) => {
    const [hour, minutePeriod] = time.split(":");
    const [minute, period] = minutePeriod.split(" ");
    let hour24 = parseInt(hour, 10);
  
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
  
    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };
  
  // Submit Handler with Validation
  const handleSubmit = async(e) => {
    e.preventDefault();

    if (loading) return;
  
    // Validation for specialization
  if (!specialization.trim()) {
    toast.error("Specialization is required.");
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

    // Validate each slot
    for (let slot of availableSlots) {
      if (!validateSlot(slot)) {
        return; // Stop submission if any slot is invalid
      }
    }
  
    // Proceed with form submission if all validations pass
    
    const formData = new FormData();
    certificates.forEach((file) => formData.append("certificates", file));
    formData.append("userId", currentUser._id);
    formData.append("specialization", specialization);
    formData.append("skills", JSON.stringify(selectedSkills));
    formData.append("availableSlots", JSON.stringify(availableSlots));

    try {
      setLoading(true);
      toast.success("All validations passed. Submitting...");
      await createMentorProfile(formData)
      toast.success("Profile created successfully!");
      // Reset state to initial values
    setSpecialization("");
    setSelectedSkills([]);
    setCertificates([]);
    setAvailableSlots([{ day: "", timeSlots: [""] }]);
    
      navigate('/')
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
      console.error("Error:", error);
    }finally {
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

        {/* Skills Dropdown */}
        <div className="form-group">
          <label className="block font-medium mb-2">Skills</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown visibility
              className="w-full px-4 py-2 border rounded-md text-left"
            >
              {selectedSkills.length > 0
                ? `${selectedSkills.length} Skills Selected`
                : "Select Skills"}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded-md shadow-md z-10">
                <ul className="max-h-60 overflow-y-auto">
                  {skills.map((skill) => (
                    <li
                      key={skill._id}
                      onClick={() => handleSkillChange(skill._id)} // Handle selection
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

       {/* Available Slots */}
       <div className="form-group">
          <label className="block font-medium mb-2">Available Slots</label>
          {availableSlots.map((slot, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              {/* Day Input */}
              <div className="flex gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Enter day (e.g., Monday)"
                  value={slot.day}
                  onChange={(e) => handleDayChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  className="text-red-500 font-bold"
                >
                  Remove Day
                </button>
              </div>
              {/* Time Slots */}
              {slot.timeSlots.map((time, timeIndex) => (
                <div key={timeIndex} className="flex gap-4 mb-2">
                  <input
                    type="text"
                    placeholder="Enter time slot (e.g., 9:00 AM - 10:30 AM)"
                    value={time}
                    onChange={(e) =>
                      handleTimeSlotChange(index, timeIndex, e.target.value)
                    }
                    className="flex-1 px-4 py-2 border rounded-md"
                  />
                  {timeIndex === slot.timeSlots.length - 1 && (
                    <button
                      type="button"
                      onClick={() => addTimeSlot(index)}
                      className="text-green-500 font-bold"
                    >
                      Add Time Slot
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index, timeIndex)}
                    className="text-red-500 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={addDay}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md"
          >
            Add Day
          </button>
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

export default MentorProfile;
