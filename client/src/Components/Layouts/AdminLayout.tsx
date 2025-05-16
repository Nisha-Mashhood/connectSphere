import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar>
        <div className="flex-1 p-6 w-full">
          <Outlet />
        </div>
      </AdminSidebar>
    </div>
  );
};

export default AdminLayout;