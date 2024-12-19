import React from "react";
import otpImage from "../../assets/OTP verification.png";
import { InputOtp } from "@nextui-org/input-otp";

const OTPVerification = () => {
  const [value, setValue] = React.useState("");
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
              We’ve sent a code to your email. Enter it below to verify.
            </p>

            <form className="mt-6" action="#" method="POST">
              <div className="flex flex-col items-start gap-2">
                <InputOtp length={4} value={value} onValueChange={setValue} />
                <div className="text-small text-default-500">
                  OTP value:{" "}
                  <span className="text-md font-medium">{value}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OTPVerification;
