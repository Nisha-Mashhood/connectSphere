import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchUserDetails, updateUserDetails } from "../../../Service/Auth.service";

interface FormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  jobTitle: string;
  industry: string;
  reasonForJoining: string;
  profilePic: File | null;
  coverPic: File | null;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  industry?: string;
  reasonForJoining?: string;
  profilePic?: string;
  coverPic?: string;
}

const CompleteProfile: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    jobTitle: "",
    industry: "",
    reasonForJoining: "",
    profilePic: null,
    coverPic: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  // Fetch user details
  const getUserDetails = async () => {
    try {
      const data = await fetchUserDetails(currentUser?._id);
      const user = data.userDetails;

      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        jobTitle: user.jobTitle || "",
        industry: user.industry || "",
        reasonForJoining: user.reasonForJoining || "",
        profilePic: null,
        coverPic: null,
      });

      setProfilePicPreview(user.profilePic || null);
      setCoverPicPreview(user.coverPic || null);
      setIsDataLoaded(true);
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  useEffect(() => {
    if (currentUser) {
      getUserDetails();
    } else {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Validation function
  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email cannot exceed 100 characters";
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Date of Birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        newErrors.dateOfBirth = "Date of Birth cannot be in the future";
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const isUnderAge =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
            ? age - 1 < 16
            : age < 16;
        if (isUnderAge) {
          newErrors.dateOfBirth = "You must be at least 16 years old";
        }
      }
    }

    // Job Title
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job Title is required";
    } else if (formData.jobTitle.length < 2) {
      newErrors.jobTitle = "Job Title must be at least 2 characters";
    } else if (formData.jobTitle.length > 50) {
      newErrors.jobTitle = "Job Title cannot exceed 50 characters";
    }

    // Industry
    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    } else if (formData.industry.length < 2) {
      newErrors.industry = "Industry must be at least 2 characters";
    } else if (formData.industry.length > 50) {
      newErrors.industry = "Industry cannot exceed 50 characters";
    }

    // Reason for Joining
    if (!formData.reasonForJoining.trim()) {
      newErrors.reasonForJoining = "Reason for Joining is required";
    } else if (formData.reasonForJoining.length < 10) {
      newErrors.reasonForJoining = "Reason must be at least 10 characters";
    } else if (formData.reasonForJoining.length > 500) {
      newErrors.reasonForJoining = "Reason cannot exceed 500 characters";
    }

    // Profile Picture (optional)
    if (formData.profilePic && !validImageTypes.includes(formData.profilePic.type)) {
      newErrors.profilePic = "Only JPEG, JPG, and PNG images are allowed";
    }

    // Cover Picture (optional)
    if (formData.coverPic && !validImageTypes.includes(formData.coverPic.type)) {
      newErrors.coverPic = "Only JPEG, JPG, and PNG images are allowed";
    }

    return newErrors;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const newErrors = validateForm();
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profilePic" | "coverPic") => {
    const file = e.target.files?.[0];
    if (file) {
      if (validImageTypes.includes(file.type)) {
        handleInputChange(type, file);
        const previewUrl = URL.createObjectURL(file);
        type === "profilePic" ? setProfilePicPreview(previewUrl) : setCoverPicPreview(previewUrl);
      } else {
        handleInputChange(type, null);
        toast.error("Only JPEG, JPG, and PNG images are allowed");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profilePic" || key === "coverPic") {
        if (value) submitData.append(key, value);
      } else {
        submitData.append(key, value);
      }
    });

    try {
      await updateUserDetails(currentUser._id, submitData);
      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-600 font-medium">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your full name"
            />
            {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email address"
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 font-medium">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your phone number (e.g., 1234567890)"
            />
            {errors.phone && <span className="text-red-500 text-sm mt-1 block">{errors.phone}</span>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-600 font-medium">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.dateOfBirth && (
              <span className="text-red-500 text-sm mt-1 block">{errors.dateOfBirth}</span>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-gray-600 font-medium">Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your job title"
            />
            {errors.jobTitle && (
              <span className="text-red-500 text-sm mt-1 block">{errors.jobTitle}</span>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="block text-gray-600 font-medium">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your industry"
            />
            {errors.industry && (
              <span className="text-red-500 text-sm mt-1 block">{errors.industry}</span>
            )}
          </div>

          {/* Reason for Joining */}
          <div>
            <label className="block text-gray-600 font-medium">Reason for Joining</label>
            <textarea
              value={formData.reasonForJoining}
              onChange={(e) => handleInputChange("reasonForJoining", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Why are you joining this platform?"
            />
            {errors.reasonForJoining && (
              <span className="text-red-500 text-sm mt-1 block">{errors.reasonForJoining}</span>
            )}
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-600 font-medium">Profile Picture</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "profilePic")}
              className="w-full py-2"
            />
            {errors.profilePic && (
              <span className="text-red-500 text-sm mt-1 block">{errors.profilePic}</span>
            )}
            {profilePicPreview && (
              <img
                src={profilePicPreview}
                alt="Profile Preview"
                className="mt-4 w-32 h-32 object-cover rounded-full border"
              />
            )}
          </div>

          {/* Cover Picture */}
          <div>
            <label className="block text-gray-600 font-medium">Cover Picture</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "coverPic")}
              className="w-full py-2"
            />
            {errors.coverPic && (
              <span className="text-red-500 text-sm mt-1 block">{errors.coverPic}</span>
            )}
            {coverPicPreview && (
              <img
                src={coverPicPreview}
                alt="Cover Preview"
                className="mt-4 w-full h-32 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;