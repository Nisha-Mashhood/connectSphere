import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { AppDispatch } from "../../redux/store";
import { signinStart, signinFailure, setOtpContext } from "../../redux/Slice/userSlice";
import { register as registerUser } from "../../Service/Auth.service";
import { SignupFormValues } from "../../validation/signUpValidation";

export function useSignup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      dispatch(signinStart());
      const response = await registerUser(data);
      console.log("Signup data : ",response);
      const email = response.email;
      const otpId = response.otpId;
      if (!otpId) {
        throw new Error("OTP ID not received");
      }
      dispatch(
        setOtpContext({
          email: email.toLowerCase().trim(),
          otpId,
          purpose: "signup",
        })
      );

      toast.success("OTP sent to your email");
      navigate("/otp");
    } catch (err) {
      console.error("Sign up Error:", err.response?.data?.message);
      dispatch(signinFailure(err.response?.data?.message || "Signup failed"));
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignup, isLoading };
}
