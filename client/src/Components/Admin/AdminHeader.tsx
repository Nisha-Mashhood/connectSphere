import { ReactNode, useEffect, useState } from 'react';
import { FaUser, FaTasks, FaSignOutAlt, FaLayerGroup, FaChalkboardTeacher, 
         FaUserFriends, FaTachometerAlt, FaBars, FaTimes, 
         FaStar, FaEnvelope, FaChartLine } from 'react-icons/fa';
import { Button, Avatar, Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../../redux/store";
import Logo from "../../assets/logo.svg";
import { logout } from '../../Service/Auth.service';
import toast from 'react-hot-toast';
import { AdminLogout } from '../../redux/Slice/userSlice';
import { getUnreadCount, markNotificationAsRead } from '../../Service/Notification.Service';
import { socketService } from '../../Service/SocketService';

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
  const [newUserCount, setNewUserCount] = useState(0);
  const [newMentorCount, setNewMentorCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAdmin } = useSelector((state: RootState) => state.user);

  console.log(currentAdmin);

  useEffect(() => {
    if (currentAdmin?.id) {
      console.log(`AdminSidebar: Initializing for admin ID: ${currentAdmin.id}`);
      const fetchUnreadCounts = async () => {
        try {
          const userCount = await getUnreadCount(currentAdmin.id, 'new_user');
          const mentorCount = await getUnreadCount(currentAdmin.id, 'new_mentor');
          console.log(`AdminSidebar: Initial unread counts - new_user: ${userCount}, new_mentor: ${mentorCount}`);
          setNewUserCount(userCount);
          setNewMentorCount(mentorCount);
        } catch (error) {
          console.error('AdminSidebar: Failed to fetch unread counts:', error);
          toast.error('Failed to fetch notification counts');
        }
      };
      fetchUnreadCounts();

      socketService.connect(currentAdmin.id, currentAdmin.token);

      const handleNewNotification = (notification: { type: string; userId: string }) => {
        console.log(`Socket: Received notification.new for type ${notification.type}, user ${notification.userId}`);
        if (notification.userId === currentAdmin.id) {
          if (notification.type === 'new_user') {
            setNewUserCount((prev) => {
              const newCount = prev + 1;
              console.log(`Socket: Updated newUserCount to ${newCount}`);
              return newCount;
            });
          } else if (notification.type === 'new_mentor') {
            setNewMentorCount((prev) => {
              const newCount = prev + 1;
              console.log(`Socket: Updated newMentorCount to ${newCount}`);
              return newCount;
            });
          }
        }
      };

      const handleNotificationRead = (data: { userId?: string; type?: string }) => {
        if (data.userId === currentAdmin.id) {
          console.log(`Socket: Notification read event for type ${data.type}, user ${data.userId}`);
          fetchUnreadCounts();
        }
      };

      socketService.onNotificationNew(handleNewNotification);
      socketService.onNotificationRead(handleNotificationRead);

      return () => {
        socketService.offNotificationNew(handleNewNotification);
        socketService.offNotificationRead(handleNotificationRead);
        socketService.disconnect();
      };
    }
  }, [currentAdmin?.id, currentAdmin?.token]);

  const handleLogout = async () => {
    const email = currentAdmin?.email;
    try {
      await logout(email);
      dispatch(AdminLogout());
      toast.success("Logout successfully!");
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error(err.response?.data?.message || "Logout Failed");
      toast.error("Logout failed");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleUserManagementClick = async () => {
    if (currentAdmin?.id && newUserCount > 0) {
      console.log(`newUserCount ${newUserCount} and it is making the newuser count -1`);
      try {
        const response = await markNotificationAsRead( undefined, currentAdmin.id, 'new_user');
        setNewUserCount(0);
        if(response){
          console.log(`AdminSidebar: Marked all new_user notifications as read for admin ${currentAdmin.id}`);
        }
      } catch (error) {
        console.error('AdminSidebar: Failed to mark new_user notifications as read:', error);
        toast.error('Failed to mark notifications as read');
      }
    }
    navigate('/admin/user');
  };

  const handleMentorManagementClick = async () => {
    if (currentAdmin?.id && newMentorCount > 0) {
    try {
      await markNotificationAsRead( undefined, currentAdmin.id, "new_mentor");
      setNewMentorCount(0);
      console.log(`AdminSidebar: Marked all new_mentor notifications as read for admin ${currentAdmin.id}`);
    } catch (error) {
      console.error("AdminSidebar: Failed to mark new_mentor notifications as read:", error);
      toast.error("Failed to mark new_mentor notifications as read");
    }
  }
  navigate("/admin/mentormange");
  };

  const navigateToProfile = () => {
  if (currentAdmin?.id) {
    navigate(`/admin/profile/${currentAdmin.id}`);
  }
}

  const navigationItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { 
      name: 'User Management', 
      path: '/admin/user', 
      icon: <FaUser />, 
      onClick: handleUserManagementClick, 
      badge: newUserCount > 0 ? newUserCount : null 
    },
    { 
      name: 'Mentor Management', 
      path: '/admin/mentormange', 
      icon: <FaUser />, 
      onClick: handleMentorManagementClick, 
      badge: newMentorCount > 0 ? newMentorCount : null 
    },
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
      <div 
        className={`bg-purple-100 text-white transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
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

          {currentAdmin && (
            <div className={`flex ${collapsed ? 'justify-center' : 'items-center'} p-4 mb-4 ${collapsed ? '' : 'space-x-4'}`}
            onClick={navigateToProfile}>
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

          <div className="flex flex-col space-y-2 px-3">
            {navigationItems.map((item, index) => {
              return (
                <Tooltip 
                  key={index}
                  content={item.name} 
                  placement="right" 
                  isDisabled={!collapsed}
                >
                  <Button
                    color={isActive(item.path) ? "secondary" : "default"}
                    variant={isActive(item.path) ? "flat" : "light"}
                    className={`justify-${collapsed ? 'center' : 'start'} w-full flex items-center`}
                    onPress={item.onClick || (() => navigate(item.path))}
                    startContent={item.icon}
                  >
                    {!collapsed && item.name}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Tooltip>
              );
            })}
          </div>
        </div>

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

      <div className="flex-1 w-full overflow-auto">
        <main className="min-h-screen w-full p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminSidebar;