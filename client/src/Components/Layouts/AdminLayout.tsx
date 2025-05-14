import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </AdminSidebar>
    </div>
  );
};

export default AdminLayout;