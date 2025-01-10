import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchUserDetails, updateUserDetails } from "../../Service/Auth.service";

const CompleteProfile: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
    coverPic: "",
    dateOfBirth: "",
    jobTitle: "",
    industry: "",
    reasonForJoining: "",
  });
  const[profilePic,setProfilePic] = useState(null);
  const[coverPic, setCoverPic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user details
  const getUserDetails = async () => {
    try {
      // const response = await axiosInstance.get(`/auth/profiledetails/${currentUser?._id}`);
      // const user = response.data.userDetails;

      const data = await fetchUserDetails(currentUser?._id);
      const user = data.userDetails;

      setUserDetails({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePic: user.profilePic || "",
        coverPic: user.coverPic || "",
        dateOfBirth: user.dateOfBirth || "",
        jobTitle: user.jobTitle || "",
        industry: user.industry || "",
        reasonForJoining: user.reasonForJoining || "",
      });
      setProfilePicPreview(user.profilePic || null);
      setCoverPicPreview(user.coverPic || null);
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

  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
const handleFileChange = (e, type) => {
  const file = e.target.files[0];

  // Validate image type
  if (!validImageTypes.includes(file.type)) {
    toast.error("Only JPEG, JPG, and PNG images are allowed");
    return;
  }

  // Set the image file and preview
  if (type === "profile") {
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  } else {
    setCoverPic(file);
    setCoverPicPreview(URL.createObjectURL(file));
  }
};

  

  // Handle skip action
  const handleSkip = () => {
    if (
      !userDetails.name ||
      !userDetails.email ||
      !userDetails.phone ||
      !userDetails.dateOfBirth ||
      !userDetails.jobTitle ||
      !userDetails.industry ||
      !userDetails.reasonForJoining ||
      !userDetails.profilePic ||
      !userDetails.coverPic
    ) {
      if (
        window.confirm(
          "Your profile is incomplete. Are you sure you want to skip?"
        )
      ) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  // Handle save action
  const handleSave = async () => {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      jobTitle,
      industry,
      reasonForJoining,
    } = userDetails;
  
    
    // Validate that all fields are filled
    if (
      !name ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !jobTitle ||
      !industry ||
      !reasonForJoining
    ) {
      toast.error("Please complete all required fields.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("jobTitle", jobTitle);
    formData.append("industry", industry);
    formData.append("reasonForJoining", reasonForJoining);
  
   // Add images only if updated
  if (profilePic && profilePic !== userDetails.profilePic) {
    formData.append("profilePic", profilePic);
  }
  if (coverPic && coverPic !== userDetails.coverPic) {
    formData.append("coverPic", coverPic);
  }
    
    setIsLoading(true);
    try {
      // Call API to update user details
      // await axiosInstance.put(
      //   `/auth/updateUserDetails/${currentUser._id}`,
      //   formData,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );

      const updatedUser = await updateUserDetails(currentUser._id, formData);
      setUserDetails(updatedUser);
  
      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          Fill out the required fields to complete your profile.
        </p>
        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-600 font-medium">Full Name</label>
            <input
              type="text"
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium">Email</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email address"
              disabled
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 font-medium">Phone</label>
            <input
              type="tel"
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails({ ...userDetails, phone: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your phone number"
              required
            />
          </div>
          {/* Date of Birth */}
          <div>
            <label className="block text-gray-600 font-medium">Date of Birth</label>
            <input
              type="date"
              value={userDetails.dateOfBirth}
              onChange={(e) =>
                setUserDetails({ ...userDetails, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="DD/MM/YYYY"
              required
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-gray-600 font-medium">Job Title</label>
            <input
              type="text"
              value={userDetails.jobTitle}
              onChange={(e) =>
                setUserDetails({ ...userDetails, jobTitle: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your Job Title"
              required
            />
          </div>
          {/* Industry */}
          <div>
            <label className="block text-gray-600 font-medium">Industry</label>
            <input
              type="text"
              value={userDetails.industry}
              onChange={(e) =>
                setUserDetails({ ...userDetails, industry: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter the industry of your job"
              required
            />
          </div>
          {/* Reason for Joining */}
          <div>
            <label className="block text-gray-600 font-medium">Reason for Joining</label>
            <input
              type="text"
              value={userDetails.reasonForJoining}
              onChange={(e) =>
                setUserDetails({ ...userDetails, reasonForJoining: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter th ereason why you wantto join this community"
              required
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-600 font-medium">
              Profile Picture
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "profile")}
              className="w-full py-2"
            />
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
            <label className="block text-gray-600 font-medium">
              Cover Picture
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "cover")}
              className="w-full py-2"
            />
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
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
