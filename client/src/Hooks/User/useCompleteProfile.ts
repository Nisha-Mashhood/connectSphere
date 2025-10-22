import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import toast from "react-hot-toast";
import { fetchUserDetails, updateUserDetails } from "../../Service/Auth.service";
import { AxiosError } from "axios";
import { CompleteProfileFormValues } from "../../validation/completeProfileValidation";
import { SubmitHandler } from "react-hook-form";

interface BackendError {
  status: string;
  error: string;
  message: string;
  details: unknown;
}

export function useCompleteProfile() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);

  const getUserDetails = async () => {
    if (!currentUser) {
      toast.error("No user logged in");
      navigate("/login");
      return;
    }

    try {
      const data = await fetchUserDetails(currentUser.id);
      console.log(data);
      const user = data.userDetails;

      setProfilePicPreview(user.profilePic || null);
      setCoverPicPreview(user.coverPic || null);
      setIsDataLoaded(true);

      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        jobTitle: user.jobTitle || "",
        industry: user.industry || "",
        reasonForJoining: user.reasonForJoining || "",
        profilePic: null,
        coverPic: null,
        profilePicPreview: user.profilePic || null,
        coverPicPreview: user.coverPic || null,
      };
    } catch (error) {
    console.error("Error details:", error);
    const axiosError = error as AxiosError<BackendError>;
    const errorMessage = axiosError.response?.data?.message || "Failed to fetch user details";
    toast.error(errorMessage);
    console.error("Fetch User Details Error:", errorMessage);
    setIsDataLoaded(true);
    return null;
  }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profilePic" | "coverPic",
    setValue: (name: string, value: unknown) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setValue(type, file);
        const previewUrl = URL.createObjectURL(file);
        setValue(`${type}Preview`, previewUrl);
        if (type === "profilePic") {
          setProfilePicPreview(previewUrl);
        } else {
          setCoverPicPreview(previewUrl);
        }
      } else {
        setValue(type, null);
        setValue(`${type}Preview`, null);
        toast.error("Only JPEG, JPG, and PNG images are allowed");
      }
    }
  };

  const handleSubmit: SubmitHandler<CompleteProfileFormValues> = async (values) => {
    if (!currentUser) {
      toast.error("No user logged in");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    const submitData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "profilePic" || key === "coverPic") {
        if (value) submitData.append(key, value as File);
      } else if (key !== "profilePicPreview" && key !== "coverPicPreview") {
        submitData.append(key, value as string);
      }
    });

    try {
      await updateUserDetails(currentUser.id, submitData);
      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      const axiosError = error as AxiosError<BackendError>;
      const errorMessage = axiosError.response?.data?.message || "Failed to save profile";
      toast.error(errorMessage);
      console.error("Update Profile Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getUserDetails,
    handleSubmit,
    handleFileChange,
    isLoading,
    isDataLoaded,
    profilePicPreview,
    coverPicPreview,
    currentUser,
  };
}