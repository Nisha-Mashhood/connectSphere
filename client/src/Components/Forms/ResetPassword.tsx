import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import resetImage from "../../assets/Reset Password.png";
import { resetPasswordSchema, ResetPasswordFormValues } from "../../validation/resetPasswordValidation";
import TextField from "../ReusableComponents/TextFiled";
import Button from "../ReusableComponents/Button";
import { useResetPassword } from "../../Hooks/Auth/useResetPassword";

const ResetPassword = () => {
  const { handleResetPassword, isLoading, resetEmail } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema(resetEmail || "")),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      email: resetEmail,
    },
    mode: "onChange",
  });

  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={resetImage}
            alt="Reset Password Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Reset Your Password for {resetEmail}
            </h1>
            <p className="text-gray-600 mt-2">Create a new password below.</p>

            <form className="mt-6" onSubmit={handleSubmit(handleResetPassword)}>
              <TextField
                label="New Password"
                type="password"
                placeholder="Enter New Password"
                registration={register("newPassword")}
                error={errors.newPassword}
              />
              <TextField
                label="Confirm Password"
                type="password"
                placeholder="Confirm New Password"
                registration={register("confirmPassword")}
                error={errors.confirmPassword}
              />

              <div className="text-right mt-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
                >
                  Log In
                </Link>
              </div>

              <Button label="Reset Password" type="submit" disabled={isLoading} />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;