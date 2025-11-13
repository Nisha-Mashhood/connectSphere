import { Routes, Route } from "react-router-dom";
import AdminLogin from "../Components/Forms/AdminLogin";
import AdminLayout from "../Components/Layouts/AdminLayout";
import AdminPrivateRoute from "../Components/Admin/AdminPrivateRout";
import AdminDashboard from "../Components/Admin/AdminDashboard";
import AdminProfile from "../Components/Admin/AdminProfile";
import Categories from "../pages/Admin/Categories";
import SubCategories from "../pages/Admin/SubCategories";
import Skills from "../pages/Admin/Skills";
import UserManage from "../pages/Admin/UserManage";
import AdminMentorRequests from "../pages/Admin/AdminMentorRequests";
import PageNotFound from "../Components/PageNotFound";
import UserDetailsPage from "../Components/Admin/UserDetails/UserDetails";
import UserMentorCollab from "../pages/Admin/User-MentorCollab";
import UserUserCollab from "../pages/Admin/User-UserCollab";
import GroupCollab from "../pages/Admin/GroupCollab";
import UserUserCollabDetails from "../Components/Admin/User-User/UserConnectionDetails/User-UserDeatils";
import GroupDetails from "../pages/Admin/GroupAndRequsetDetails";
import CollaborationDetails from "../pages/Admin/CollaborationDetails";
import ReviewManagement from "../pages/Admin/ReviewManagement";
import Messages from "../pages/Admin/ContactMessage";
import MentorAnalytics from "../pages/Admin/MentorAnalytics";
import SalesReport from "../pages/Admin/SalesReport";

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route element={<AdminPrivateRoute />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="categories" element={<Categories />} />
        <Route path="subcategories/:categoryId" element={<SubCategories />} />
        <Route path="skills/:categoryId/:subcategoryId" element={<Skills />} />
        <Route path="user" element={<UserManage />} />
        <Route path="users/:userId" element={<UserDetailsPage />} />
        <Route path="mentormange" element={<AdminMentorRequests />} />
        <Route path="userMentorManagemnt" element={<UserMentorCollab />} />
        <Route path="collaboration/:collabId" element={<CollaborationDetails />} />
        <Route path="request/:requestId" element={<CollaborationDetails />} />
        <Route path="user-collab/:connId" element={<UserUserCollabDetails />} />
        <Route path="userUserMangemnt" element={<UserUserCollab />} />
        <Route path="groupManagemnt" element={<GroupCollab />} />
        <Route path="group/:groupId" element={<GroupDetails />} />
        <Route path="group-request/:requestId" element={<GroupDetails />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="messages" element={<Messages/>} />
        <Route path="mentor-analytics" element={<MentorAnalytics />} />
        <Route path="sales-report" element={<SalesReport />} />
        
      </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default AdminRoutes;
