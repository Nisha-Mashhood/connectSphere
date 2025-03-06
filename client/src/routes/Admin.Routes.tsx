import { Routes, Route } from "react-router-dom";
import AdminLogin from "../Components/Admin/AdminLogin";
import AdminLayout from "../Components/Layouts/AdminLayout";
import AdminPrivateRoute from "../Components/Admin/AdminPrivateRout";
import AdminDashboard from "../Components/Admin/AdminDashboard";
import AdminProfile from "../Components/Admin/AdminProfile";
import Categories from "../Components/Admin/Categories";
import SubCategories from "../Components/Admin/SubCategories";
import Skills from "../Components/Admin/Skills";
import UserManage from "../Components/Admin/UserManage";
import AdminMentorRequests from "../Components/Admin/AdminMentorRequests";
import PageNotFound from "../Components/PageNotFound";
import UserDetailsPage from "../Components/Admin/UserDetailsPage";
import UserMentorCollab from "../Components/Admin/User-MentorCollab";
import UserUserCollab from "../Components/Admin/User-UserCollab";
import GroupCollab from "../Components/Admin/GroupCollab";
import UserUserCollabDetails from "../Components/Admin/User-UserDeatils";
import GroupDetails from "../Components/Admin/GroupAndRequsetDetails";
import CollaborationDetails from "../Components/Admin/CollaborationDetails";

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

        
      </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default AdminRoutes;
