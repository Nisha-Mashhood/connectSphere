import { useDispatch } from "react-redux";
import forgotImage from "../../assets/Forgot password.png";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { axiosInstance } from "../../lib/axios";
import {
  setResetEmail,
  signinFailure,
  signinStart,
} from "../../redux/Slice/userSlice";
import toast from "react-hot-toast";
const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: { email: string }) => {
    try {
      dispatch(signinStart());
      await axiosInstance.post("/auth/register/forgot-password", data);
      dispatch(setResetEmail(data.email));
      toast.success("OTP sent successfully!");
      navigate("/otp"); // Navigate to the dashboard or home page
    } catch (error: any) {
      // Using react-hot-toast to show error
      toast.error(error.response?.data?.message || "Submission failed");
      dispatch(
        signinFailure(error.response?.data?.message || "Submission failed")
      );
    }
  };

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* Left Section with SVG */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={forgotImage}
            alt="Forgot Password Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section with Forgot Password Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Forgot Your Password?
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your email address, and we’ll send you an OTP to reset your
              password.
            </p>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:bg-white focus:outline-none`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && typeof errors.email.message === "string" && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div className="text-right mt-2">
                <Link
                  to="/login"
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Log In
                </Link>
              </div>

              <button
                type="submit"
                className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
              >
                Send OTP
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
