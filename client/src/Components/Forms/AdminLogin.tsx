import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
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
        toast.error("You are not authorized as admin.");
        dispatch(signinFailure("Unauthorized"));
        return;
      }

      const passkey = prompt("Enter the admin passkey:");
      if (!passkey?.trim()) {
        toast.error("Admin passkey is required.");
        return;
      }

      const { valid } = await adminPasscodeCheck(passkey);
      if (!valid) {
        toast.error("Invalid admin passkey.");
        dispatch(signinFailure("Invalid passkey"));
        return;
      }

      toast.success("Welcome, Admin!");
      dispatch(setIsAdmin(user));
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Login failed";
      dispatch(signinFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center pb-0 pt-6">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">Secure access only</p>
        </CardHeader>

        <CardBody className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-gray-700 border border-gray-600 data-[hover=true]:bg-gray-600",
              }}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-gray-700 border border-gray-600 data-[hover=true]:bg-gray-600",
              }}
            />

            {/* Hidden role field */}
            <input type="hidden" {...register("role")} />

            {/* Submit */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className="w-full font-semibold"
            >
              {isSubmitting ? "Authenticating..." : "Log In as Admin"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminLogin;