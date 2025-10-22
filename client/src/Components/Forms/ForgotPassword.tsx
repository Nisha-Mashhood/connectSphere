import { Link } from "react-router-dom";
import forgotImage from "../../assets/Forgot password.png";
import TextField from "../ReusableComponents/TextFiled";
import Button from "../ReusableComponents/Button";
import { useForgotPassword } from "../../Hooks/Auth/useForgotPassword";

const ForgotPassword = () => {
  const { register, handleSubmit, handleForgotPassword, errors, isSubmitting } = useForgotPassword();

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={forgotImage}
            alt="Forgot Password Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Forgot Your Password?
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your email address, and we’ll send you an OTP to reset your
              password.
            </p>

            <form className="mt-6" onSubmit={handleSubmit(handleForgotPassword)}>
              <TextField
                label="Email Address"
                type="email"
                placeholder="Enter Email Address"
                registration={register("email")}
                error={errors.email}
              />

              <div className="text-right mt-2">
                <Link
                  to="/login"
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Log In
                </Link>
              </div>

              <Button label="Send OTP" type="submit" disabled={isSubmitting} />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;