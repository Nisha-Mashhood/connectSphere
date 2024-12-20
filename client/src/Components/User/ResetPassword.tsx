import { useDispatch, useSelector } from "react-redux";
import restImage from "../../assets/Reset Password.png";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RootState } from "../../redux/store";
import toast from "react-hot-toast";
import {
  clearResetEmail,
  signinFailure,
  signinStart,
} from "../../redux/Slice/userSlice";
import { axiosInstance } from "../../lib/axios";
const ResetPassword = () => {
  const resetEmail = useSelector((state: RootState) => state.user.resetEmail);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      dispatch(signinStart());
      const payload = { email: resetEmail, newPassword: data.newPassword };
      await axiosInstance.post("/auth/register/reset-password", payload);
      toast.success("Password reset successfully!");
      dispatch(clearResetEmail()); // Clear email from Redux
      navigate("/login"); // Redirect to login page
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password reset failed");
      dispatch(
        signinFailure(error.response?.data?.message || "Password reset failed")
      );
    }
  };
  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* Left Section with SVG */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={restImage}
            alt="Reset Password Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section with Reset Password Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Reset Your Password for {resetEmail}
            </h1>
            <p className="text-gray-600 mt-2">Create a new password below.</p>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:bg-white focus:outline-none`}
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />

                {errors.newPassword &&
                  typeof errors.newPassword.message === "string" && (
                    <p className="text-red-500 text-sm">
                      {errors.newPassword.message}
                    </p>
                  )}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-blue-500 focus:bg-white focus:outline-none`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword &&
                  typeof errors.confirmPassword.message === "string" && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
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
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
