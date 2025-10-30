import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import Header from "../Components/User/Common/Header";
import Login from "../Components/Forms/Login";
import Signup from "../Components/Forms/Signup";
import ForgotPassword from "../Components/Forms/ForgotPassword";
import OTPVerification from "../Components/Forms/OtpVerification";
import ResetPassword from "../Components/Forms/ResetPassword";
import PrivateRoute from "../Components/User/PrivateRoute";
import CompleteProfile from "../Components/User/UserComponents/CompleteProfile";
import MentorProfileForm from "../Components/Forms/MentorProfileForm";
import ProfileDisplay from "../Components/User/Mentor/ProfileDisplay";
import PageNotFound from "../Components/PageNotFound";
import { ForbiddenPage } from "../Components/ForebiddenPage";
import GithubCallback from "../Components/User/Auth/GithubCallback";
import About from "../Components/User/Common/About";
import CreateGroupForm from "../Components/Forms/CreateGroupForm";
import GroupDashboard from "../Components/User/Profile/GroupSection/GroupDashboard/GroupDashboard";
import GroupDetail from "../Components/User/Profile/GroupSection/GroupDetails/GroupDetails";
import CollaborationDetails from "../Components/User/Profile/ActiveCollaborations/CollaboartionDetails/CollaborationDetails";
import Chat from "../Components/User/Common/Chat/Chat";
import MentorDashBoard from "../Components/User/Common/Profile/MentorDashBoard";
import ExploreMentors from "../pages/User/Explore/Explore";
import Profile from "../pages/User/Profile/Profile";



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
        <Route path="/explorementor" element={<ExploreMentors />} />
        <Route path="/create-group" element={<CreateGroupForm />} />
        <Route path="/groupDashboard/:groupId" element={<GroupDashboard />} />
        <Route path="/group/:groupId" element={<GroupDetail />} />
        <Route path="/collaboration/:collabId" element={<CollaborationDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:type/:id" element={<Chat />} />
        <Route path="/mentor-dashboard" element={<MentorDashBoard />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
      <Route path='/forbidden' element={<ForbiddenPage/>} />
    </Routes>
  </>
);

export default UserRoutes;
