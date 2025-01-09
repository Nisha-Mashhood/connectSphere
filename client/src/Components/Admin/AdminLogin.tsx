import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signinStart, setIsAdmin, signinFailure } from "../../redux/Slice/userSlice";
import { axiosInstance } from "../../lib/axios";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      dispatch(signinStart());
      const response = await axiosInstance.post("/auth/login", data);
      const user = response.data.user;

      if (user.role === "admin") {
        const passkey = prompt("Enter the admin passkey:");
        if (passkey) {
          const isPasskeyValid = await axiosInstance.post("/auth/verify-admin-passkey", { passkey });

          if (isPasskeyValid.data.valid) {
            toast.success("Welcome, Admin!");
            dispatch(setIsAdmin(user));
            navigate("/admin/dashboard", { replace: true });
          } else {
            toast.error("Invalid admin passkey.");
          }
        } else {
          toast.error("Admin passkey is required.");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Admin login failed");
      dispatch(signinFailure(error.response?.data?.message || "Admin login failed"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-sm p-6 bg-gray-800 text-white shadow-md rounded-md">
        <h2 className="mb-6 text-2xl font-semibold text-center">Admin Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Admin email"
              className={`w-full px-4 py-2 mt-1 bg-gray-700 border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Admin password"
              className={`w-full px-4 py-2 mt-1 bg-gray-700 border ${
                errors.password ? "border-red-500" : "border-gray-600"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Log In as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
