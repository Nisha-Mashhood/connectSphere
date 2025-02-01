import { FaUser, FaTasks, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { Button, Avatar } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import Logo from "../../assets/logo.svg";
import { logout } from '../../Service/Auth.service';
import toast from 'react-hot-toast';
import { AdminLogout } from '../../redux/Slice/userSlice';

export const ConnectSphereLogo = () => {
  return (
    <div className="navbar-logo h-5 w-20">
      <img src={Logo} alt="Logo" />
    </div>
  );
};

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentAdmin } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    const email = currentAdmin?.email;
    try {
      await logout(email);
      dispatch(AdminLogout());
      toast.success("Logout successfully!");
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error(err.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar bg-gray-800 text-white w-64 h-screen p-6 flex flex-col justify-between">
        {/* Admin Avatar and Info */}
        {currentAdmin && (
          <div className="flex items-center space-x-4 mb-8">
            <Avatar
              isBordered
              as="button"
              color="secondary"
              name={currentAdmin.name}
              size="lg"
              src={currentAdmin.profilePic}
            />
            <div>
              <p className="font-semibold">{currentAdmin.name}</p>
              <p className="text-sm">{currentAdmin.email}</p>
            </div>
          </div>
        )}

        {/* Sidebar Navigation */}
        <div className="flex flex-col space-y-4 mb-auto">
          <Button
            color="secondary"
            className="w-full text-left"
            onPress={() => navigate("/admin/user")}
            startContent={<FaUser />}
          >
            User Management
          </Button>
          <Button
            color="secondary"
            className="w-full text-left"
            onPress={() => navigate("/admin/mentormange")}
            startContent={<FaUser />}
          >
            Mentor Management
          </Button>
          <Button
            color="secondary"
            className="w-full text-left"
            onPress={() => navigate("/admin/categories")}
            startContent={<FaTasks />}
          >
            Skill Management
          </Button>
          <Button
            color="secondary"
            className="w-full text-left"
            startContent={<FaChartBar />}
          >
            Report
          </Button>
          <Button
            color="secondary"
            className="w-full text-left"
            startContent={<FaTasks />}
          >
            Task Management
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          color="danger"
          className="w-full"
          onPress={handleLogout}
          startContent={<FaSignOutAlt />}
        >
          Log Out
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Content will go here */}
      </div>
    </div>
  );
};

export default AdminSidebar;
