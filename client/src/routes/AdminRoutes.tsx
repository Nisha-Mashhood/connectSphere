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
        <Route path="mentormange" element={<AdminMentorRequests />} />
      </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default AdminRoutes;
