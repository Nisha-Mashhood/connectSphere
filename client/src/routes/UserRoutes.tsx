import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import Header from "../Components/User/Header";
import Login from "../Components/User/Login";
import Signup from "../Components/User/Signup";
import ForgotPassword from "../Components/User/ForgotPassword";
import OTPVerification from "../Components/User/OtpVerification";
import ResetPassword from "../Components/User/ResetPassword";
import Profile from "../Components/User/Profile";
import PrivateRoute from "../Components/User/PrivateRoute";
import CompleteProfile from "../Components/User/CompleteProfile";
import MentorProfile from "../Components/User/MentorProfile";
import Mentorship from "../Components/User/Mentorship";
import PageNotFound from "../Components/PageNotFound";

const UserRoutes = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/otp" element={<OTPVerification />} />
      <Route path="/reset" element={<ResetPassword />} />

      <Route element={<PrivateRoute />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mentorProfile" element={<MentorProfile />} />
        <Route path="/mentorship" element={<Mentorship />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </>
);

export default UserRoutes;
