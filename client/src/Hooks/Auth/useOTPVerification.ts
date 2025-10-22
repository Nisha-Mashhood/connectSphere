import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signinStart, signinFailure } from "../../redux/Slice/userSlice";
import { RootState } from "../../redux/store";
import { sentOTP, verifyOTP } from "../../Service/Auth.service";
import { otpSchema, OTPFormValues } from "../../validation/otpValidation";

export function useOTPVerification() {
  const resetEmail = useSelector((state: RootState) => state.user.resetEmail);
  const normalizedEmail = resetEmail ? resetEmail.toLowerCase().trim() : "";
  const [timeLeft, setTimeLeft] = useState(120);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<OTPFormValues>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!normalizedEmail) {
      toast.error("Email is required");
      navigate("/forgot");
      return;
    }
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendEnabled(true);
    }
  }, [timeLeft, normalizedEmail, navigate]);

  const handleOTPChange = (value: string) => {
    console.log("OTP Input:", value);
    setValue("otp", value, { shouldValidate: true });
  };

  const handleVerifyOTP = async (values: OTPFormValues) => {
    const data = { email: normalizedEmail, otp: values.otp };
    console.log("Form Data:", data);
    console.log("Form Errors:", errors);
    if (Object.keys(errors).length > 0) {
      console.warn("Form has validation errors, submission blocked");
      toast.error("Please fix form errors before submitting");
      return;
    }
    try {
      dispatch(signinStart());
      const otpSuccess = await verifyOTP(data);
      console.log("verifyOTP Response:", otpSuccess);
      if (otpSuccess.status === 'success') {
        console.log("OTP Verification Successful, Navigating to /reset");
        toast.success("OTP verified successfully!");
        navigate("/reset");
      } else {
        dispatch(signinFailure("Invalid OTP"));
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Submission failed";
      console.error("Submission Error:", errorMessage);
      dispatch(signinFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const handleResendOtp = async () => {
    if (!isResendEnabled) return;
    try {
      await sentOTP(normalizedEmail);
      toast.success("OTP has been resent!");
      setTimeLeft(120);
      setIsResendEnabled(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again.";
      console.error("Resend OTP Error:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return {
    register,
    handleSubmit,
    handleVerifyOTP,
    errors,
    isSubmitting,
    timeLeft,
    isResendEnabled,
    handleResendOtp,
    handleOTPChange,
    otpValue: getValues("otp"),
    resetEmail: normalizedEmail,
  };
}