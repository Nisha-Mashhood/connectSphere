import LoginImage from "../../assets/Login.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  signinFailure,
  signinStart,
  signinSuccess,
  unsetIsAdmin,
} from "../../redux/Slice/userSlice";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import GoogleLogin from "./GoogleLogin";
import GitHub from "./GitHub";
import { useEffect } from "react";
// import { RootState } from "../../redux/store";

const Login = () => {
  // const { isAdmin } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Display error message if passed through route state
  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
    }
  }, [location.state]);

  // Handle login form submission
  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      dispatch(signinStart());
      const response = await axiosInstance.post("/auth/login", data);
      const user = response.data.user;

      // Regular user login
      if (user.role !== "admin") {
      toast.success("Login successful!");
      dispatch(signinSuccess(user));
      dispatch(unsetIsAdmin());

      // Check if profile is complete
    const profileResponse = await axiosInstance.get(`/auth/check-profile/${user._id}`);
    const isProfileComplete = profileResponse.data.isProfileComplete;

    if (!isProfileComplete) {
      toast.error("Complete your profile before proceeding.");
      navigate("/complete-profile", { replace: true }); 
      return;
    }
      navigate("/", { replace: true });
  }else{
    toast.error('Wrong Credentials.')
  }
    } catch (error: any) {
      if (error.response?.data?.message === "Blocked") {
        toast.error("Your account is blocked. Please contact support.");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      dispatch(signinFailure(error.response?.data?.message || "Login failed"));
    }
  };

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* Left Section with SVG */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <div className="flex justify-center items-center h-full">
            <img src={LoginImage} alt="Logo" />
          </div>
        </div>

        {/* Right Section with Login Form */}
        <div
          className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
        flex items-center justify-center"
        >
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Log in to your account
            </h1>

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

              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:bg-white focus:outline-none`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                  })}
                />
                {errors.password &&
                  typeof errors.password.message === "string" && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
              </div>

              <div className="text-right mt-2">
                <Link
                  to="/forgot"
                  className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg
              px-4 py-3 mt-6"
              >
                Log In
              </button>
            </form>

            <hr className="my-6 border-gray-300 w-full" />

            {/* Google Login Button */}
            <GoogleLogin />

            {/* GitHub Login Button */}
            <GitHub />

            <p className="mt-8">
              Need an account?{" "}
              <Link
                to="/signup"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
