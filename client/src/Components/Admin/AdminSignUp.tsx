import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { adminSigninFailure, adminSigninStart } from "../../redux/Slice/userSlice";
import { axiosInstance } from "../../lib/axios";

interface FormData {
  name: string;
  email: string;
  password: string;
}

const AdminSignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

    const ValidateForm = () => {
      // Name Validation
      if (!formData.name.trim()) {
        toast.error("Full name is required");
        return false;
      }
      if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
        toast.error("Full name can only contain alphabets");
        return false;
      }
      if (formData.name.trim().length < 3) {
        toast.error("Name must be at least 3 characters long");
        return false;
      }
      if (formData.name.trim().length > 50) {
        toast.error("Name cannot exceed 50 characters");
        return false;
      }
      if (/ {2,}/.test(formData.name)) {
        toast.error("Name cannot contain multiple consecutive spaces");
        return false;
      }
    
      // Email Validation
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return false;
      }
      if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
      ) {
        toast.error("Invalid email format");
        return false;
      }
      if (formData.email.endsWith("@example.com")) {
        toast.error("Email from @example.com domain is not allowed");
        return false;
      }
      if (formData.email.length > 100) {
        toast.error("Email cannot exceed 100 characters");
        return false;
      }
      if (/ {2,}/.test(formData.email)) {
        toast.error("Email cannot contain multiple consecutive spaces");
        return false;
      }
    
      // Password Validation
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(formData.password)) {
        toast.error(
          "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
        return false;
      }
      if (/(\d)\1{2,}/.test(formData.password)) {
        toast.error("Password cannot contain sequential repeated digits");
        return false;
      }
      if (/([A-Za-z])\1{2,}/.test(formData.password)) {
        toast.error("Password cannot contain sequential repeated letters");
        return false;
      }
      if (formData.password.includes(formData.name.trim())) {
        toast.error("Password cannot contain your name");
        return false;
      }
      if (formData.password.includes(formData.email.split("@")[0])) {
        toast.error("Password cannot contain parts of your email");
        return false;
      }
      if (/ {2,}/.test(formData.password)) {
        toast.error("Password cannot contain multiple consecutive spaces");
        return false;
      }
    
      return true; // All validations passed
    };
    
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = ValidateForm();
      
      if (success === true){
        // console.log("validataion success");
  
        setLoading(true);
        setError(false);
      dispatch(adminSigninStart());
      try {
        await axiosInstance.post("/admin/auth/register/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        Navigate("/admin/login");
        toast.success("Admin Registered Successfully");
      } catch (err: any) {
        console.error(err);
        dispatch(adminSigninFailure(err.response?.data?.message || "Signup failed"));
        setError(true);
      } finally {
        setLoading(false);
      }
      } 
    };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-4xl text-center font-bold text-gray-800 my-6">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="Username"
          id="name"
          className="bg-gray-50 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="bg-gray-50 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-gray-50 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-75"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>
      <div className="flex justify-center gap-1 mt-6 text-gray-600">
        <p>Already have an account?</p>
        <Link to="/admin/login">
          <span className="text-blue-600 hover:underline">Sign In</span>
        </Link>
      </div>
      <p className="text-center text-red-600 mt-4">{error && "Something went wrong"}</p>
    </div>
  )
}

export default AdminSignUp