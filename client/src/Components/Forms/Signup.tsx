import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { signinStart, signinFailure } from "../../redux/Slice/userSlice.ts";
import { register } from "../../Service/Auth.service.ts";
import SignupImage from "../../assets/Signup.png";
import SignupGoogle from "../User/Auth/SignupGoogle.tsx";
import SignupGithub from "../User/Auth/SignupGithub.tsx";

const Signup = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  // Yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Full name is required")
      .matches(/^[A-Za-z ]+$/, "Full name can only contain alphabets")
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name cannot exceed 50 characters")
      .test(
        "no-multiple-spaces",
        "Name cannot contain multiple consecutive spaces",
        (value) => !/\s{2,}/.test(value)
      ),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format")
      .max(100, "Email cannot exceed 100 characters")
      .notOneOf(
        ["@example.com"],
        "Email from @example.com domain is not allowed"
      )
      .test(
        "no-multiple-spaces",
        "Email cannot contain multiple consecutive spaces",
        (value) => !/\s{2,}/.test(value)
      ),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
        "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .test(
        "no-sequential-repeated-digits",
        "Password cannot contain sequential repeated digits",
        (value) => !/(\d)\1{2,}/.test(value)
      )
      .test(
        "no-sequential-repeated-letters",
        "Password cannot contain sequential repeated letters",
        (value) => !/([A-Za-z])\1{2,}/.test(value)
      )
      .test(
        "no-name-in-password",
        "Password cannot contain your name",
        function (value) {
          const { name } = this.parent;
          return !value.includes(name.trim());
        }
      )
      .test(
        "no-email-in-password",
        "Password cannot contain parts of your email",
        function (value) {
          const { email } = this.parent;
          return !value.includes(email.split("@")[0]);
        }
      )
      .test(
        "no-multiple-spaces",
        "Password cannot contain multiple consecutive spaces",
        (value) => !/\s{2,}/.test(value)
      ),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      dispatch(signinStart());
      await register(values);
      toast.success("User Registered Successfully");
      Navigate("/login");
    } catch (err: any) {
      console.error(err);
      dispatch(signinFailure(err.response?.data?.message || "Signup failed"));
      toast.error(err.response?.data?.message || "Signup failed");
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

            {/* Google Signup Button */}
            <SignupGoogle/>

            {/* GitHub Signup Button */}
            <SignupGithub/>

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
