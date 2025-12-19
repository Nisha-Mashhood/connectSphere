import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import {
  signinStart,
  signinFailure,
  signinSuccess,
  clearOtpContext,
  setOtpContext,
  unsetIsAdmin,
  setForgotOtpVerified,
  setIsAdmin,
} from "../../redux/Slice/userSlice";
import { AppDispatch, RootState } from "../../redux/store";

import {
  fetchCollabDetails,
  fetchGroupDetailsForMembers,
  fetchGroupRequests,
  fetchGroups,
  fetchMentorDetails,
  fetchRequests,
  fetchUserConnections,
} from "../../redux/Slice/profileSlice";

import { resendOTP, verifyOTP, checkProfile } from "../../Service/Auth.service";
import { otpSchema, OTPFormValues } from "../../validation/otpValidation";

export function useOTPVerification() {
  const otpContext = useSelector((state: RootState) => state.user.otpContext);

  const [timeLeft, setTimeLeft] = useState(120);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<OTPFormValues>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  /* -------------------- Timer -------------------- */
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendEnabled(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  /* -------------------- OTP input -------------------- */
  const handleOTPChange = (value: string) => {
    setValue("otp", value, { shouldValidate: true });
  };

  /* -------------------- Verify OTP -------------------- */
  const handleVerifyOTP = async (values: OTPFormValues) => {
    if (!otpContext) return;

    try {
      dispatch(signinStart());

      const payload = {
        email: otpContext.email,
        otpId: otpContext.otpId,
        purpose: otpContext.purpose,
        otp: values.otp,
      };

      const response = await verifyOTP(payload);

      if (response.status !== "success") {
        throw new Error("OTP verification failed");
      }


      const purpose = otpContext.purpose;


      /* ---------------- LOGIN FLOW ---------------- */
      if (purpose === "login") {
        const { user, needsReviewPrompt, accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        localStorage.setItem("userId", user.id);
        dispatch(signinSuccess({ user, needsReviewPrompt }));

        /* ---------- ADMIN LOGIN ---------- */
        if (user.role === "admin") {
          dispatch(setIsAdmin(user));
          toast.success("Welcome, Admin!");
          navigate("/admin/dashboard", { replace: true });
          setTimeout(() => {
          dispatch(clearOtpContext());
        }, 100);
          return;
        }

        /* ---------- USER / MENTOR LOGIN ---------- */
        dispatch(unsetIsAdmin());
        let mentorDetails = null;
        if (user.role === "mentor") {
          mentorDetails = await dispatch(fetchMentorDetails(user.id)).unwrap();
          if (mentorDetails?.id) {
            await dispatch(
              fetchCollabDetails({ userId: mentorDetails.id, role: "mentor" })
            );
          }
        } else {
          dispatch(fetchCollabDetails({ userId: user.id, role: "user" }));
        }

        dispatch(
          fetchRequests({
            userId: user.id,
            role: user.role,
            mentorId: mentorDetails?.id,
          })
        );

        dispatch(fetchGroups(user.id));
        dispatch(fetchGroupRequests(user.id));
        dispatch(fetchGroupDetailsForMembers(user.id));
        dispatch(fetchUserConnections(user.id));

        const profileResponse = await checkProfile(user.id);

        toast.success("Login successful!");

        if (!profileResponse.isProfileComplete) {
          navigate("/complete-profile", { replace: true });
          return;
        }

        navigate("/", { replace: true });
        setTimeout(() => {
          dispatch(clearOtpContext());
        }, 100);
        return;
      }

      /* ---------------- FORGOT PASSWORD ---------------- */
      if (otpContext.purpose === "forgot_password") {
        dispatch(setForgotOtpVerified(true));
        toast.success("OTP verified successfully");
        navigate("/reset", { replace: true });
        setTimeout(() => {
          dispatch(clearOtpContext());
        }, 100);
        return;
      }

      /* ---------------- SIGNUP ---------------- */
      toast.success("OTP verified successfully");
      navigate("/login", { replace: true });
      dispatch(clearOtpContext());
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      dispatch(signinFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  /* -------------------- Resend OTP -------------------- */
  const handleResendOtp = async () => {
    if (!otpContext || !isResendEnabled) return;

    try {
      setValue("otp", "");

      const { otpId } = await resendOTP({
        email: otpContext.email,
        purpose: otpContext.purpose,
      });

      dispatch(
        setOtpContext({
          email: otpContext.email,
          purpose: otpContext.purpose,
          otpId,
        })
      );

      toast.success("OTP resent successfully");
      setTimeLeft(120);
      setIsResendEnabled(false);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return {
    handleSubmit,
    handleVerifyOTP,
    handleOTPChange,
    handleResendOtp,
    errors,
    isSubmitting,
    timeLeft,
    isResendEnabled,
    otpValue: getValues("otp"),
  };
}
