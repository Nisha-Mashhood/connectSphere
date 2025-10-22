import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setResetEmail, signinStart, signinFailure } from "../../redux/Slice/userSlice";
import { sentOTP } from "../../Service/Auth.service";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "../../validation/forgotPasswordValidation";

export function useForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    console.log("Form Data:", values);
    console.log("Form Errors:", errors);
    if (Object.keys(errors).length > 0) {
      console.warn("Form has validation errors, submission blocked");
      toast.error("Please fix form errors before submitting");
      return;
    }
    try {
      dispatch(signinStart());
      await sentOTP(values.email);
      dispatch(setResetEmail(values.email));
      toast.success("OTP sent successfully!");
      navigate("/otp");
    } catch (error) {
      console.error("Submission Error:", error.response?.data?.message);
      dispatch(signinFailure(error.response?.data?.message || "Submission failed"));
      toast.error(error.response?.data?.message || "Submission failed");
    }
  };

  return {
    register,
    handleSubmit,
    handleForgotPassword,
    errors,
    isSubmitting,
  };
}