import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { RootState } from "../../redux/store";
import { fetchUserDetails, updateUserDetails } from "../../Service/Auth.service";

const CompleteProfile: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null); // Added state to hold initial form values

  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  // Fetch user details
  const getUserDetails = async () => {
    try {
      const data = await fetchUserDetails(currentUser?._id);
      const user = data.userDetails;

      setInitialValues({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        jobTitle: user.jobTitle || "",
        industry: user.industry || "",
        reasonForJoining: user.reasonForJoining || "",
        profilePic: "",
        coverPic: "",
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

  // Handle file changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profilePic" | "coverPic",
    setFieldValue: any
  ) => {
    const file = e.target.files?.[0];

    if (file && validImageTypes.includes(file.type)) {
      setFieldValue(type, file);
      const previewUrl = URL.createObjectURL(file);
      type === "profilePic"
        ? setProfilePicPreview(previewUrl)
        : setCoverPicPreview(previewUrl);
    } else {
      toast.error("Only JPEG, JPG, and PNG images are allowed");
    }
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    dateOfBirth: Yup.string().required("Date of Birth is required"),
    jobTitle: Yup.string().required("Job Title is required"),
    industry: Yup.string().required("Industry is required"),
    reasonForJoining: Yup.string().required("Reason for Joining is required"),
  });

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key === "profilePic" || key === "coverPic") {
        if (values[key]) formData.append(key, values[key]);
      } else {
        formData.append(key, values[key]);
      }
    });

    try {
      await updateUserDetails(currentUser._id, formData);
      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If initial values are null, render loading state
  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-600 font-medium">Full Name</label>
                <Field
                  type="text"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-600 font-medium">Email</label>
                <Field
                  type="text"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email address"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-600 font-medium">Phone</label>
                <Field
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your phone number"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-gray-600 font-medium">Date of Birth</label>
                <Field
                  type="date"
                  name="dateOfBirth"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="dateOfBirth"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-gray-600 font-medium">Job Title</label>
                <Field
                  type="text"
                  name="jobTitle"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your job title"
                />
                <ErrorMessage
                  name="jobTitle"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-gray-600 font-medium">Industry</label>
                <Field
                  type="text"
                  name="industry"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your industry"
                />
                <ErrorMessage
                  name="industry"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Reason for joining */}
              <div>
                <label className="block text-gray-600 font-medium">Reason for Joining</label>
                <Field
                  as="textarea"
                  name="reasonForJoining"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Why are you joining this platform?"
                />
                <ErrorMessage
                  name="reasonForJoining"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-gray-600 font-medium">Profile Picture</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "profilePic", setFieldValue)}
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
                <label className="block text-gray-600 font-medium">Cover Picture</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "coverPic", setFieldValue)}
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
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save and Continue"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CompleteProfile;
