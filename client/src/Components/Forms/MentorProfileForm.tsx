import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../../Service/Category.Service";
import { createMentorProfile } from "../../Service/Mentor.Service";

interface Errors {
  specialization?: string;
  bio?: string;
  price?: string;
  skills?: string;
  certificates?: string;
  availableSlots?: string;
  timePeriod?: string;
}

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<any[]>([]); 
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState("");
  const [certificates, setCertificates] = useState<File[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ day: string; timeSlots: string[] }[]>([]);
  const [timePeriod, setTimePeriod] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Fetch skills from the Skill collection
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setSkills(data.skills);
      } catch (error) {
        toast.error("Failed to fetch skills");
        console.log("Mentor Profile form :",error)
      }
    };
    if (currentUser._id) {
      fetchSkills();
    }
  }, [currentUser]);

  // Validation function
  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    if (!specialization.trim()) newErrors.specialization = "Specialization is required";
    else if (specialization.length < 3) newErrors.specialization = "Specialization must be at least 3 characters";
    else if (specialization.length > 100) newErrors.specialization = "Specialization cannot exceed 100 characters";

    if (!bio.trim()) newErrors.bio = "Bio is required";
    else if (bio.length < 10) newErrors.bio = "Bio must be at least 10 characters";
    else if (bio.length > 500) newErrors.bio = "Bio cannot exceed 500 characters";

    if (!price) newErrors.price = "Price is required";
    else if (Number(price) <= 100) newErrors.price = "Price must be greater than ₹100";

    if (selectedSkills.length === 0) newErrors.skills = "At least one skill is required";

    if (certificates.length === 0) newErrors.certificates = "At least one certificate is required";

    if (availableSlots.length === 0) newErrors.availableSlots = "At least one available slot is required";

    if (!timePeriod) newErrors.timePeriod = "Number of sessions is required";
    else if (Number(timePeriod) < 5) newErrors.timePeriod = "You must offer at least 5 sessions";

    return newErrors;
  };

  // Handle input changes with immediate validation
  const handleInputChange = (field: keyof Errors, value) => {
    switch (field) {
      case "specialization":
        setSpecialization(value);
        break;
      case "bio":
        setBio(value);
        break;
      case "price":
        setPrice(value);
        break;
      case "timePeriod":
        setTimePeriod(value);
        break;
      case "skills":
        setSelectedSkills(value);
        break;
      case "certificates":
        setCertificates(value);
        break;
      case "availableSlots":
        setAvailableSlots(value);
        break;
    }
    // Validate immediately and update errors
    const newErrors = validateForm();
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      if (!newErrors[field]) delete updatedErrors[field]; 
      else updatedErrors[field] = newErrors[field];
      return updatedErrors;
    });
  };

  // Handle skill selection
  const handleSkillChange = (skillId: string) => {
    const updatedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    handleInputChange("skills", updatedSkills);
  };

  // Handle certificate upload
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast.error("You can only upload a maximum of 2 certificates.");
      handleInputChange("certificates", []);
    } else {
      handleInputChange("certificates", files);
    }
  };

  const getSkillName = (skillId: string) => {
    const skill = skills.find((s) => s._id === skillId);
    return skill ? skill.name : "";
  };

  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const TIME_SLOTS = [
    "09:00 AM - 10:30 AM",
    "10:30 AM - 12:00 PM",
    "01:00 PM - 02:30 PM",
    "02:30 PM - 04:00 PM",
    "04:00 PM - 05:30 PM",
  ];

  const handleAddSlot = () => {
    if (!selectedDay || !selectedTime) {
      toast.error("Please select both day and time");
      return;
    }

    if (
      !availableSlots.some((slot) => slot.day === selectedDay) &&
      availableSlots.length >= 3
    ) {
      toast.error("You can only add up to 3 days");
      return;
    }

    const existingDaySlot = availableSlots.find((slot) => slot.day === selectedDay);
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

    const updatedSlots = existingDaySlot
      ? availableSlots.map((slot) =>
          slot.day === selectedDay
            ? { ...slot, timeSlots: [...slot.timeSlots, selectedTime].sort() }
            : slot
        )
      : [
          ...availableSlots,
          { day: selectedDay, timeSlots: [selectedTime] },
        ].sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));

    handleInputChange("availableSlots", updatedSlots);
    setSelectedTime("");
  };

  const handleRemoveSlot = (day: string, time: string) => {
    const updatedSlots = availableSlots
      .map((slot) => {
        if (slot.day === day) {
          const newTimeSlots = slot.timeSlots.filter((t) => t !== time);
          return newTimeSlots.length ? { ...slot, timeSlots: newTimeSlots } : null;
        }
        return slot;
      })
      .filter(Boolean) as { day: string; timeSlots: string[] }[];
    handleInputChange("availableSlots", updatedSlots);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const formData = new FormData();
    certificates.forEach((file) => formData.append("certificates", file));
    formData.append("userId", currentUser._id);
    formData.append("specialization", specialization);
    formData.append("bio", bio);
    formData.append("price", price);
    formData.append("skills", JSON.stringify(selectedSkills));
    formData.append("availableSlots", JSON.stringify(availableSlots));
    formData.append("timePeriod", timePeriod);

    try {
      setLoading(true);
      await createMentorProfile(formData);
      toast.success("Profile created successfully!");
      setSpecialization("");
      setBio("");
      setPrice("");
      setTimePeriod("");
      setSelectedSkills([]);
      setCertificates([]);
      setAvailableSlots([]);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred. Please try again later."
      );
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Create Mentor Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Specialization */}
        <div className="form-group">
          <label className="block font-medium mb-2">Specialization</label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => handleInputChange("specialization", e.target.value)}
            placeholder="Enter your specialization"
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.specialization && (
            <span className="text-red-500 text-sm">{errors.specialization}</span>
          )}
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="block font-medium mb-2">
            Bio
            <span className="block text-sm font-normal text-gray-600 mt-1">
              Write a brief introduction about yourself, your experience, and what students can expect.
            </span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Enter your bio"
            className="w-full px-4 py-2 border rounded-md min-h-[120px]"
          />
          {errors.bio && <span className="text-red-500 text-sm">{errors.bio}</span>}
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="block font-medium mb-2">
            Session Price (in ₹)
            <span className="block text-sm font-normal text-gray-600 mt-1">
              Set your per-hour fee (min ₹101, ₹100 deducted as platform fee).
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              value={price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="Enter price per hour"
              className="w-full pl-8 pr-4 py-2 border rounded-md"
              min="0"
            />
          </div>
          {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
          <p className="text-sm text-gray-500 mt-1">
            Your earnings per session: ₹{price ? (Number(price) - 100).toString() : "0"}
          </p>
        </div>

        {/* Skills Dropdown */}
        <div className="form-group">
          <label className="block font-medium mb-2">Skills</label>
          <div className="relative">
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
                    className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
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
            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded-md shadow-md z-10">
                <ul className="max-h-60 overflow-y-auto">
                  {skills.map((skill) => (
                    <li
                      key={skill._id}
                      onClick={() => handleSkillChange(skill._id)}
                      className={`px-4 py-2 cursor-pointer ${
                        selectedSkills.includes(skill._id) ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {errors.skills && <span className="text-red-500 text-sm">{errors.skills}</span>}
        </div>

        {/* Certificates */}
        <div className="form-group">
          <label className="block font-medium mb-2">Certificates</label>
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            multiple
            onChange={handleCertificateUpload}
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.certificates && (
            <span className="text-red-500 text-sm">{errors.certificates}</span>
          )}
          <p className="text-sm text-gray-500 mt-1">You can upload a maximum of 2 certificates.</p>
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

        {/* Time Period */}
        <div className="form-group">
          <label className="block font-medium mb-2">
            Number of Sessions
            <span className="block text-sm font-normal text-gray-600 mt-1">
              Specify how many sessions (min 5, one per week).
            </span>
          </label>
          <input
            type="number"
            value={timePeriod}
            onChange={(e) => handleInputChange("timePeriod", e.target.value)}
            placeholder="Enter the number of sessions"
            className="w-full px-4 py-2 border rounded-md"
            min="1"
          />
          {errors.timePeriod && (
            <span className="text-red-500 text-sm">{errors.timePeriod}</span>
          )}
        </div>

        {/* Available Slots */}
        <div className="form-group space-y-4">
          <label className="block font-medium mb-2">Available Slots</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Choose a day</option>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Choose a time</option>
                {TIME_SLOTS.map((time) => (
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
          {errors.availableSlots && (
            <span className="text-red-500 text-sm">{errors.availableSlots}</span>
          )}
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
            loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default MentorProfileForm;