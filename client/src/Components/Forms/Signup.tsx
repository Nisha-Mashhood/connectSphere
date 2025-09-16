import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { signinStart, signinFailure } from "../../redux/Slice/userSlice.ts";
import { register } from "../../Service/Auth.service.ts";
import SignupImage from "../../assets/Signup.png";
import SignupGoogle from "../User/Auth/SignupGoogle.tsx";
import SignupGithub from "../User/Auth/SignupGithub.tsx";
import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  emailFormat,
  noMultipleSpaces,
  namePattern,
  passwordPattern,
  noSequentialRepeatedDigits,
  noSequentialRepeatedLetters,
  noNameInPassword,
  noEmailInPassword,
} from "../../validation/validationRules.ts"; 

const Signup = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  // Yup validation
  const validationSchema = Yup.object({
    name: required("Full name is required")
      .concat(namePattern())
      .concat(minLength(3, "Name must be at least 3 characters long"))
      .concat(maxLength(50, "Name cannot exceed 50 characters"))
      .concat(noMultipleSpaces()),
    email: required("Email is required")
      .concat(emailFormat())
      .concat(maxLength(100, "Email cannot exceed 100 characters"))
      .concat(noMultipleSpaces())
      .notOneOf(
        ["@example.com"],
        "Email from @example.com domain is not allowed"
      ),
    password: required("Password is required")
      .concat(passwordPattern())
      .concat(minLength(8, "Password must be at least 8 characters long"))
      .concat(maxLength(20, "Password cannot exceed 20 characters"))
      .concat(noSequentialRepeatedDigits())
      .concat(noSequentialRepeatedLetters())
      .concat(noNameInPassword())
      .concat(noEmailInPassword())
      .concat(noMultipleSpaces()),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      dispatch(signinStart());
      await register(values);
      toast.success("User Registered Successfully");
      Navigate("/login");
    } catch (err) {
      console.error("Sign up Error : ", err.response?.data?.message);
      dispatch(signinFailure(err.response?.data?.message || "Signup failed"));
      toast.error("Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* Left Section with Signup Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Create an Account
            </h1>

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="mt-6">
                  <div>
                    <label className="block text-gray-700">Full Name</label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="Enter Full Name"
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-600 text-sm"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-700">Email Address</label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter Email Address"
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-600 text-sm"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-700">Password</label>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Create Password"
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-600 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                  >
                    {isSubmitting ? "Loading..." : "Sign Up"}
                  </button>
                </Form>
              )}
            </Formik>
            <hr className="my-6 border-gray-300 w-full" />

            {/* Google & GitHub Signup Button */}
            <SignupGoogle />
            <SignupGithub />

            <p className="mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section with Image */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={SignupImage}
            alt="Signup Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
};

export default Signup;