import LoginImage from "../../assets/Login.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  signinFailure,
  signinStart,
  signinSuccess,
  unsetIsAdmin,
} from "../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import GoogleLogin from "./GoogleLogin";
import GitHub from "./GitHub";
import { useEffect } from "react";
import { login, checkProfile } from "../../Service/Auth.service";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
    }
  }, [location.state]);

  // Form validation schema with Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  });

  // Handle login form submission
  const onSubmit = async (values: { email: string; password: string; role: 'user' }) => {
    try {
      dispatch(signinStart());
      const { user } = await login(values);
      console.log(user);
  
      // Check user role
      if (user.role === 'admin') {
        toast.error("Invalid credentials for user login");
        return;
      }
  
      // Check if user is blocked
      if (user.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }
  
      toast.success("Login successful!");
      dispatch(signinSuccess(user));
      dispatch(unsetIsAdmin());
  
      const profileResponse = await checkProfile(user._id);
      const isProfileComplete = profileResponse.isProfileComplete;
  
      if (!isProfileComplete) {
        navigate("/complete-profile", { replace: true });
        return;
      }
      navigate("/", { replace: true });
    } catch (error: any) {
      handleLoginError(error, dispatch);
    }
  };

  // Error handling function
const handleLoginError = (error: any, dispatch: any) => {
  const errorMessage = error.message || "Login failed";
  toast.error(errorMessage);
  dispatch(signinFailure(errorMessage));
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

            {/* Formik Form */}
            <Formik
              initialValues={{ email: "", password: "",role:"" }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              <Form className="mt-6" noValidate>
                <div>
                  <label className="block text-gray-700">Email Address</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter Email Address"
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700">Password</label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-sm"
                  />
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
              </Form>
            </Formik>

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
