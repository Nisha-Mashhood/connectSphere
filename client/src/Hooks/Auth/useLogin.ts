import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  setOtpContext,
  signinFailure,
} from "../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { login } from "../../Service/Auth.service";
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
      const { user, otpId } = await login({ ...values, role: "user"});

      if (user.role === "admin") {
        toast.error("Invalid credentials for user login");
        return;
      }
      if (user.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }
      dispatch(
        setOtpContext({
          email: user.email,
          otpId,
          purpose: "login",
        })
      );
      toast.success("OTP sent to your email");
      navigate("/otp");
    } catch (error) {
      const axiosError = error as AxiosError<BackendError>;
      const errorMessage =
        axiosError.response?.data?.message ||
        error.message ||
        "Invalid Credentials";
      dispatch(signinFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
}
