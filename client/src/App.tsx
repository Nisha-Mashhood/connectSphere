import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/User/Home";
import Header from "./Components/User/Header";
import Login from "./Components/User/Login";
import Signup from "./Components/User/Signup";
import ForgotPassword from "./Components/User/ForgotPassword";
import OTPVerification from "./Components/User/OtpVerification";
import ResetPassword from "./Components/User/ResetPassword";
import Profile from "./Components/User/Profile";
import Categories from "./Components/Admin/Categories";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./Components/User/PrivateRoute";
import AdminPrivateRoute from "./Components/Admin/AdminPrivateRout";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminLogin from "./Components/Admin/AdminLogin";
import AdminSignUp from "./Components/Admin/AdminSignUp";
import AdminProfile from "./Components/Admin/AdminProfile";
import PageNotFound from "./Components/PageNotFound";
import AdminHeader from "./Components/Admin/AdminHeader";
import SubCategories from "./Components/Admin/SubCategories";
import Skills from "./Components/Admin/Skills";
// import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  // const GoogleOAuthWrapper = () =>{
  //   return(
  //     <GoogleOAuthProvider clientId='262075947289-073n0lv1ifch18cnipv6jl9vfqms9r5u.apps.googleusercontent.com'>
  //       <Login />
  //     </GoogleOAuthProvider>
  //   )
  // }
  const location = useLocation();

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {isAdminRoute ? <AdminHeader /> : <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/reset" element={<ResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="signup" element={<AdminSignUp />} />

          <Route element={<AdminPrivateRoute />}>
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories/:categoryId" element={<SubCategories/>} />
          <Route path="skills/:categoryId/:subcategoryId" element={<Skills/>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
