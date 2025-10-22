import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  signinFailure,
  signinStart,
  signinSuccess,
  unsetIsAdmin,
} from "../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import {
  fetchCollabDetails,
  fetchGroupDetailsForMembers,
  fetchGroupRequests,
  fetchGroups,
  fetchMentorDetails,
  fetchRequests,
  fetchUserConnections,
} from "../../redux/Slice/profileSlice";
import { login, checkProfile } from "../../Service/Auth.service";
import { LoginFormValues } from "../../validation/loginValidation";
import { useState } from "react";
import { AxiosError } from "axios"; 

export interface BackendError {
  status: string;
  error: string;
  message: string;
  details: unknown;
}

export function useLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      dispatch(signinStart());
      const { user, needsReviewPrompt } = await login({ ...values, role: "user" });

      if (user.role === "admin") {
        toast.error("Invalid credentials for user login");
        return;
      }
      if (user.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }

      localStorage.setItem("userId", user.id);
      dispatch(signinSuccess({ user, needsReviewPrompt }));
      dispatch(unsetIsAdmin());

      await new Promise((resolve) => setTimeout(resolve, 500));

      let mentorDetails = null;
      if (user.role === "mentor") {
        mentorDetails = await dispatch(fetchMentorDetails(user.id)).unwrap();
        if (mentorDetails?.id) {
          await dispatch(fetchCollabDetails({ userId: mentorDetails.id, role: "mentor" }));
        }
      } else {
        dispatch(fetchCollabDetails({ userId: user.id, role: "user" }));
      }

      dispatch(fetchRequests({ userId: user.id, role: user.role, mentorId: mentorDetails?.id }));
      dispatch(fetchGroups(user.id));
      dispatch(fetchGroupRequests(user.id));
      dispatch(fetchGroupDetailsForMembers(user.id));
      dispatch(fetchUserConnections(user.id));

      const profileResponse = await checkProfile(user.id);
      if (!profileResponse.isProfileComplete) {
        toast.success("Login successful!");
        navigate("/complete-profile", { replace: true });
        return;
      }

      toast.success("Login successful!");
      navigate("/", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<BackendError>;
      const errorMessage = axiosError.response?.data?.message || "Invalid Credentials";
      dispatch(signinFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Login Failed:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
}
