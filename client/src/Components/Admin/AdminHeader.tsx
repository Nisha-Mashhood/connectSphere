import { ReactNode, useState } from 'react';
import { FaUser, FaTasks, FaSignOutAlt, FaLayerGroup, FaChalkboardTeacher, 
         FaUserFriends, FaTachometerAlt, FaBars, FaTimes, 
         FaStar, FaEnvelope, 
         FaChartLine} from 'react-icons/fa';
import { Button, Avatar, Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../../redux/store";
import Logo from "../../assets/logo.svg";
import { logout } from '../../Service/Auth.service';
import toast from 'react-hot-toast';
import { AdminLogout } from '../../redux/Slice/userSlice';

export const ConnectSphereLogo = () => {
  return (
    <div className="flex items-center h-12">
      <img src={Logo} alt="Logo" className="h-8" />
    </div>
  );
};

interface AdminSidebarProps {
  children: ReactNode;
}

const AdminSidebar = ({ children }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "User Management", path: "/admin/user", icon: <FaUser /> },
    { name: "Mentor Management", path: "/admin/mentormange", icon: <FaUser /> },
    { name: "Skill Management", path: "/admin/categories", icon: <FaTasks /> },
    { name: "User-Mentor Management", path: "/admin/userMentorManagemnt", icon: <FaChalkboardTeacher /> },
    { name: "User-User Management", path: "/admin/userUserMangemnt", icon: <FaUserFriends /> },
    { name: "Group Management", path: "/admin/groupManagemnt", icon: <FaLayerGroup /> },
    { name: "Review Management", path: "/admin/reviews", icon: <FaStar /> },
    { name: "Messages", path: "/admin/messages", icon: <FaEnvelope /> },
    { name: "Mentor Analytics", path: "/admin/mentor-analytics", icon: <FaChartLine /> },
    { name: "Sales Report", path: "/admin/sales-report", icon: <FaChartLine /> },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div 
        className={`bg-purple-100 text-white transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Header with logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {!collapsed && <ConnectSphereLogo />}
            <Button
              isIconOnly
              color="default"
              variant="light"
              onPress={() => setCollapsed(!collapsed)}
              className="text-white"
            >
              {collapsed ? <FaBars /> : <FaTimes />}
            </Button>
          </div>

          {/* Admin Avatar and Info */}
          {currentAdmin && (
            <div className={`flex ${collapsed ? 'justify-center' : 'items-center'} p-4 mb-4 ${collapsed ? '' : 'space-x-4'}`}>
              <Tooltip content={currentAdmin.name} placement="right" isDisabled={!collapsed}>
                <Avatar
                  isBordered
                  as="button"
                  color="secondary"
                  name={currentAdmin.name}
                  size={collapsed ? "md" : "lg"}
                  src={currentAdmin.profilePic}
                />
              </Tooltip>
              {!collapsed && (
                <div>
                  <p className="font-semibold text-blue-950">{currentAdmin.name}</p>
                  <p className="text-sm text-blue-400">{currentAdmin.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex flex-col space-y-2 px-3">
            {navigationItems.map((item, index) => (
              <Tooltip 
                key={index}
                content={item.name} 
                placement="right" 
                isDisabled={!collapsed}
              >
                <Button
                  color={isActive(item.path) ? "secondary" : "default"}
                  variant={isActive(item.path) ? "flat" : "light"}
                  className={`justify-${collapsed ? 'center' : 'start'} w-full`}
                  onPress={() => navigate(item.path)}
                  startContent={item.icon}
                >
                  {!collapsed && item.name}
                </Button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 mb-2">
          <Tooltip content="Logout" placement="right" isDisabled={!collapsed}>
            <Button
              color="danger"
              className={`w-full justify-${collapsed ? 'center' : 'start'}`}
              onPress={handleLogout}
              startContent={<FaSignOutAlt />}
            >
              {!collapsed && "Log Out"}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-auto">
        <main className="min-h-screen w-full p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminSidebar;