import { Link } from "react-router-dom";
import otpImage from "../../assets/OTP verification.png";
import Button from "../ReusableComponents/Button";
import InputOTP from "../ReusableComponents/InputOTP";
import { useOTPVerification } from "../../Hooks/Auth/useOTPVerification";

const OTPVerification = () => {
  const {
    handleSubmit,
    handleVerifyOTP,
    errors,
    isSubmitting,
    timeLeft,
    isResendEnabled,
    handleResendOtp,
    handleOTPChange,
    otpValue,
    resetEmail,
  } = useOTPVerification();

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={otpImage}
            alt="OTP Verification Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Enter Verification Code
            </h1>
            <p className="text-gray-600 mt-2">
              We’ve sent a code to your email <strong>{resetEmail}</strong>. Enter it below to verify.
            </p>

            <form className="mt-6" onSubmit={handleSubmit(handleVerifyOTP)}>
              <div className="flex flex-col items-start gap-2">
                <InputOTP
                  value={otpValue}
                  onValueChange={handleOTPChange}
                  error={errors.otp}
                  length={6}
                />
                
                <div className="text-small text-default-500">
                  OTP value: <span className="text-md font-medium">{otpValue}</span>
                </div>

                {isResendEnabled ? (
                  <Button
                    type="button"
                    label="Resend OTP"
                    disabled={!isResendEnabled}
                    onClick={handleResendOtp}
                  />
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

              <Button label="Verify" type="submit" disabled={isSubmitting} />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OTPVerification;