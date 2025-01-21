import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import Header from "../Components/User/Common/Header";
import Login from "../Components/User/Auth/Login";
import Signup from "../Components/User/Auth/Signup";
import ForgotPassword from "../Components/User/Auth/ForgotPassword";
import OTPVerification from "../Components/User/Auth/OtpVerification";
import ResetPassword from "../Components/User/Auth/ResetPassword";
import Profile from "../Components/User/Common/Profile";
import PrivateRoute from "../Components/User/PrivateRoute";
import CompleteProfile from "../Components/User/UserComponents/CompleteProfile";
import MentorProfile from "../Components/User/Mentor/MentorProfile";
import ProfileDisplay from "../Components/User/Mentor/Mentorship";
import PageNotFound from "../Components/PageNotFound";
import { ForbiddenPage } from "../Components/ForebiddenPage";
import GithubCallback from "../Components/User/Auth/GithubCallback";
import ExploreMentor from "../Components/User/UserComponents/ExploreMentor";
import MyMentorProfilePage from "../Components/User/Mentor/MyMentorProfilePage";
import UserProfile from "../Components/User/UserComponents/UserProfile";
import About from "../Components/User/Common/About";



const UserRoutes = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/otp" element={<OTPVerification />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/github/callback" element={<GithubCallback />} />

      <Route element={<PrivateRoute />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mentorProfile" element={<MentorProfile />} />
        <Route path="/profileDispaly/:Id" element={< ProfileDisplay />} />
        <Route path="/mymentorProfilePage" element={< MyMentorProfilePage />} />
        <Route path="/explorementor" element={<ExploreMentor />} />
        <Route path="/userProfile/:userId" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
      <Route path='/forbidden' element={<ForbiddenPage/>} />
    </Routes>
  </>
);

export default UserRoutes;
