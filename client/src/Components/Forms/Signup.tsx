import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import SignupImage from "../../assets/Signup.png";
import SignupGoogle from "../User/Auth/SignupGoogle";
import SignupGithub from "../User/Auth/SignupGithub";
import { signupSchema, SignupFormValues } from "../../validation/signUpValidation";
import TextField from "../ReusableComponents/TextFiled";
import Button from "../ReusableComponents/Button";
import { useSignup } from "../../Hooks/Auth/useSignup";

const Signup = () => {
  const { handleSignup, isLoading } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
        <div className="w-full">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
            Create an Account
          </h1>

          <form className="mt-6" onSubmit={handleSubmit(handleSignup)}>
            <TextField
              label="Full Name"
              placeholder="Enter Full Name"
              registration={register("name")}
              error={errors.name}
            />
            <TextField
              label="Email Address"
              type="email"
              placeholder="Enter Email Address"
              registration={register("email")}
              error={errors.email}
            />
            <TextField
              label="Password"
              type="password"
              placeholder="Create Password"
              registration={register("password")}
              error={errors.password}
            />

            <Button label="Sign Up" type="submit" disabled={isLoading} />
          </form>

          <hr className="my-6 border-gray-300 w-full" />

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

      <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
        <img
          src={SignupImage}
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default Signup;
