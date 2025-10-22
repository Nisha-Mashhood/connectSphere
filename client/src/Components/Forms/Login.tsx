import LoginImage from "../../assets/Login.png";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import GoogleLogin from "../User/Auth/GoogleLogin";
import GitHub from "../User/Auth/GitHub";
import { loginSchema, LoginFormValues } from "../../validation/loginValidation";
import TextField from "../ReusableComponents/TextFiled";
import Button from "../ReusableComponents/Button";
import { useLogin } from "../../Hooks/Auth/useLogin";

const Login = () => {
  const { handleLogin, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      <div className="bg-indigo-600 lg:block w-full md:w-1/2 xl:w-2/3 h-screen flex justify-center items-center">
        <img src={LoginImage} alt="Logo" />
      </div>

      <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
        <div className="w-full">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
            Log in to your account
          </h1>

          <form className="mt-6" onSubmit={handleSubmit(handleLogin)}>
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
              placeholder="Enter Password"
              registration={register("password")}
              error={errors.password}
            />

            <div className="text-right mt-2">
              <Link
                to="/forgot"
                className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            <Button label="Log In" type="submit" disabled={isLoading} />
          </form>

          <hr className="my-6 border-gray-300 w-full" />

          <GoogleLogin />
          <GitHub />

          <p className="mt-8">
            Need an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:text-blue-700 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
