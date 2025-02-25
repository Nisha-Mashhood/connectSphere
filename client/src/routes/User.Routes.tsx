import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import Header from "../Components/User/Common/Header";
import Login from "../Components/User/Auth/Login";
import Signup from "../Components/User/Auth/Signup";
import ForgotPassword from "../Components/User/Auth/ForgotPassword";
import OTPVerification from "../Components/User/Auth/OtpVerification";
import ResetPassword from "../Components/User/Auth/ResetPassword";
import Profile from "../Components/User/Common/Profile/Profile";
import PrivateRoute from "../Components/User/PrivateRoute";
import CompleteProfile from "../Components/User/UserComponents/CompleteProfile";
import MentorProfileForm from "../Components/User/Mentor/MentorProfileForm";
import ProfileDisplay from "../Components/User/Mentor/Mentorship";
import PageNotFound from "../Components/PageNotFound";
import { ForbiddenPage } from "../Components/ForebiddenPage";
import GithubCallback from "../Components/User/Auth/GithubCallback";
import ExploreMentor from "../Components/User/UserComponents/ExploreMentor";
// import MyMentorProfilePage from "../Components/User/Mentor/MyMentorProfilePage";
import UserProfile from "../Components/User/UserComponents/UserProfile";
import About from "../Components/User/Common/About";
import CreateGroupForm from "../Components/User/Groups/CreateGroupForm";
import GroupDetails from "../Components/User/Common/Profile/GroupDetails";
import GroupDetailView from "../Components/User/Common/Profile/GroupDetailView";
import CollaborationDetails from "../Components/User/Common/Profile/CollaborationDetails";



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
        <Route path="/mentorProfile" element={<MentorProfileForm />} />
        <Route path="/profileDispaly/:Id" element={< ProfileDisplay />} />
        <Route path="/explorementor" element={<ExploreMentor />} />
        <Route path="/userProfile/:userId" element={<UserProfile />} />
        <Route path="/create-group" element={<CreateGroupForm />} />
        <Route path="/groupDetails/:groupId" element={<GroupDetails />} />
        <Route path="/group/:groupId" element={<GroupDetailView />} />
        <Route path="/collaboration/:collabId" element={<CollaborationDetails />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
      <Route path='/forbidden' element={<ForbiddenPage/>} />
    </Routes>
  </>
);

export default UserRoutes;
