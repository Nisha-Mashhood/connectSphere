import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import toast from "react-hot-toast";
import { clearForgotOtpVerified, clearResetEmail, signinFailure, signinStart } from "../../redux/Slice/userSlice";
import { resetPassword } from "../../Service/Auth.service";
import { ResetPasswordFormValues } from "../../validation/resetPasswordValidation";

export function useResetPassword() {
  const { isForgotOtpVerified, resetEmail } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  if (!isForgotOtpVerified || !resetEmail) {
    navigate("/forgot");
  }
}, [isForgotOtpVerified, navigate, resetEmail]);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      dispatch(signinStart());
      const data = { email: resetEmail, newPassword: values.newPassword };
      await resetPassword(data);
      toast.success("Password reset successfully!");
      dispatch(clearForgotOtpVerified());
      dispatch(clearResetEmail());
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Password reset failed";
      toast.error("Password reset failed");
      dispatch(signinFailure(errorMessage));
      console.log("Reset Password Error: ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleResetPassword, isLoading, resetEmail };
}