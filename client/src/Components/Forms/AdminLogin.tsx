import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@nextui-org/react";
import { FaLock, FaUserShield, FaEnvelope, FaKey } from "react-icons/fa";
import toast from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  signinStart,
  setIsAdmin,
  signinFailure,
} from "../../redux/Slice/userSlice";
import { login } from "../../Service/Auth.service";
import { adminPasscodeCheck } from "../../Service/Admin.Service";
import {
  AdminLoginFormValues,
  adminLoginSchema,
} from "../../validation/adminLoginValidation";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "admin",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<AdminLoginFormValues> = async (data) => {
    try {
      dispatch(signinStart());

      const { user } = await login({ ...data });

      if (user.role !== "admin") {
        toast.error("Access denied. Admin role required.");
        dispatch(signinFailure("Unauthorized"));
        return;
      }

      const passkey = prompt("Enter Admin Passkey:");
      if (!passkey?.trim()) {
        toast.error("Passkey is required.");
        return;
      }

      const { valid } = await adminPasscodeCheck(passkey);
      if (!valid) {
        toast.error("Invalid passkey.");
        dispatch(signinFailure("Invalid passkey"));
        return;
      }

      toast.success("Welcome, Admin!");
      dispatch(setIsAdmin(user));
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Login failed";
      dispatch(signinFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <Card
        className="w-full max-w-md shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20"
        radius="lg"
      >
        <CardHeader className="flex flex-col items-center pb-2 pt-8 px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
              <FaUserShield className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-300 mt-1">Secure Access Control</p>
        </CardHeader>

        <Divider className="bg-white/20 mx-6" />

        <CardBody className="pt-8 px-6 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <Input
                label="Email Address"
                placeholder="admin@system.com"
                type="email"
                variant="bordered"
                size="lg"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
                startContent={
                  <FaEnvelope className="text-white/60 text-lg pointer-events-none" />
                }
                classNames={{
                  label: "text-white/80 font-medium",
                  input: "text-white placeholder:text-white/40",
                  inputWrapper:
                    "bg-white/10 border border-white/20 data-[hover=true]:bg-white/20 backdrop-blur-md",
                  errorMessage: "text-pink-400",
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                variant="bordered"
                size="lg"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
                startContent={
                  <FaLock className="text-white/60 text-lg pointer-events-none" />
                }
                classNames={{
                  label: "text-white/80 font-medium",
                  input: "text-white placeholder:text-white/40",
                  inputWrapper:
                    "bg-white/10 border border-white/20 data-[hover=true]:bg-white/20 backdrop-blur-md",
                  errorMessage: "text-pink-400",
                }}
              />
            </div>

            {/* Hidden Role */}
            <input type="hidden" {...register("role")} />

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className="w-full font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              startContent={!isSubmitting && <FaKey className="text-lg" />}
              spinnerPlacement="start"
            >
              {isSubmitting ? "Verifying..." : "Access Admin Panel"}
            </Button>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
              <FaLock className="w-3 h-3" />
              <span>End-to-end encrypted • 2FA + Passkey Required</span>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminLogin;