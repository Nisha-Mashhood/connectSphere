import  { useState, useEffect } from "react";
import otpImage from "../../../assets/OTP verification.png";
import { InputOtp } from "@nextui-org/input-otp";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signinStart } from "../../../redux/Slice/userSlice";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { sentOTP, verifyOTP } from "../../../Service/Auth.service";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const OTPVerification = () => {
  const resetEmail = useSelector((state: RootState) => state.user.resetEmail);
  const [timeLeft, setTimeLeft] = useState(120); // Timer for 2 minutes
  const [isResendEnabled, setIsResendEnabled] = useState(false); // State for enabling resend OTP
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // OTP validation schema using Yup
  const validationSchema = Yup.object({
    otp: Yup.string()
      .length(6, "OTP must be exactly 6 digits")
      .matches(/^[0-9]+$/, "OTP must only contain digits")
      .required("OTP is required"),
  });

  // Handle OTP submission
  const onSubmit = async (values: { otp: string }) => {
    const data = { email: resetEmail, otp: values.otp };
    try {
      dispatch(signinStart());
      const otpSuccess = await verifyOTP(data);

      if (otpSuccess.status === 200) {
        toast.success("OTP verified successfully!");
        navigate("/reset");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Submission failed");
    }
  };

  // Timer effect
  useEffect(() => {
    if (!resetEmail) {
      toast.error("Email is required");
      navigate("/forgot-password");
      return null;
    }
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      setIsResendEnabled(true); // Enable the resend OTP button after timer ends
    }
  }, [timeLeft]);

  // Resend OTP logic
  const handleResendOtp = async () => {
    if (!isResendEnabled) return; // Don't resend if not enabled
    try {
      await sentOTP(resetEmail);
      toast.success("OTP has been resent!");
      setTimeLeft(120); // Reset the timer
      setIsResendEnabled(false); // Disable resend until the timer resets
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* Left Section with Image */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={otpImage}
            alt="OTP Verification Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section with OTP Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Enter Verification Code
            </h1>
            <p className="text-gray-600 mt-2">
              We’ve sent a code to your email <strong>{resetEmail}</strong>. Enter it below to verify.
            </p>

            <Formik
              initialValues={{ otp: "" }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ values, handleChange, handleBlur }) => (
                <Form className="mt-6">
                  <div className="flex flex-col items-start gap-2">
                    {/* OTP Input */}
                    <InputOtp
                      length={6}
                      value={values.otp}
                      onValueChange={(val) => handleChange({ target: { name: "otp", value: val } })}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      name="otp"
                      component="p"
                      className="text-red-500 text-sm"
                    />

                    <div className="text-small text-default-500">
                      OTP value: <span className="text-md font-medium">{values.otp}</span>
                    </div>

                    {/* Resend OTP Section */}
                    {isResendEnabled ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-indigo-600 mt-2"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        You can resend OTP in {timeLeft} seconds
                      </p>
                    )}

                    <div className="text-right mt-2">
                      <Link
                        to="/forgot"
                        className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                  >
                    Verify
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OTPVerification;
