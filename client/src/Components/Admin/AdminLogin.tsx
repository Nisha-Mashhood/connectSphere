import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { adminSigninFailure, adminSigninStart, adminSigninSuccess } from '../../redux/Slice/userSlice';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const { error } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();

   
      //handle the submit of the form
  const onSubmit = async (data: { email: string; password: string }) => {

    try {
      dispatch(adminSigninStart());
      const response = await axiosInstance.post("/admin/auth/login", data);
      dispatch(adminSigninSuccess(response.data.Admin));
      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      // Using react-hot-toast to show error
      toast.error(error.response?.data?.message || "Login failed");
      dispatch(adminSigninFailure(error.response?.data?.message || "Login failed"));
    }
  };


  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Admin Sign In </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="email"
          id="email"
          className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:border-blue-500 focus:bg-white focus:outline-none`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
            errors.password ? "border-red-500" : "border-gray-300"
          } focus:border-blue-500 focus:bg-white focus:outline-none`}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
        />
        <button
          className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg
              px-4 py-3 mt-6"
        >
          Log In
        </button>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Dont Have an Account ?</p>
        <Link to="/admin/signup">
          <span className="text-blue-500">Sign-Up</span>
        </Link>
      </div>
      <p className="text-red-700 mt-5">{error ? error || "Something went Wrong" : " "}</p>
    </div>
  )
}

export default AdminLogin