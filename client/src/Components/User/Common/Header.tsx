import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
  Badge,
} from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { RootState } from "../../../redux/store";
import { checkProfile, logout } from "../../../Service/Auth.service";
import { checkMentorProfile } from "../../../Service/Mentor.Service";
import Logo from "../../../assets/logoMain.jpg";
import { markNotificationAsRead } from "../../../redux/Slice/notificationSlice";
import { markNotificationAsRead as markNotificationService } from "../../../Service/Notification.Service";
import { Notification } from "../../../types";
import { socketService } from "../../../Service/SocketService";

export const ConnectSphereLogo = () => {
  return (
    <div className="h-8 w-24">
      <img src={Logo} alt="ConnectSphere Logo" className="h-full w-full object-contain" />
    </div>
  );
};

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading } = useSelector((state: RootState) => state.user);
  const { taskNotifications, taskUnreadCount, chatNotifications, chatUnreadCount } = useSelector(
    (state: RootState) => state.notification
  );

  const showNotifications = currentUser && currentUser.role !== "admin" && !loading;

  const handleNotificationClick = async (notification: Notification) => {
    if (!currentUser || currentUser.role === "admin") {
      navigate("/login");
      return;
    }
    try {
      console.log("Clicked on notification:", notification);
      await markNotificationService(notification._id, currentUser._id);
      dispatch(markNotificationAsRead(notification._id));
      socketService.markNotificationAsRead(notification._id, currentUser._id);

      if (notification.type === "mentor_approved" || notification.type === "collaboration_status") {
        navigate("/profile");
      } else if (notification.type === "task_reminder") {
        if (!notification.taskContext) {
          toast.error("Task context not found.");
          return;
        }
        const { contextType, contextId } = notification.taskContext;
        console.log(`Navigating to task context: ${contextType}, ID: ${contextId}`);
        if (contextType === "profile") {
          navigate(`/profile?taskId=${notification.relatedId}`);
        } else if (contextType === "collaboration") {
          navigate(`/collaboration/${contextId}?taskId=${notification.relatedId}`);
        } else if (contextType === "group") {
          navigate(`/group/${contextId}?taskId=${notification.relatedId}`);
        } else if (contextType === "userconnection") {
          navigate(`/profile?taskId=${notification.relatedId}`);
        }
      } else {
        const [type] = notification.relatedId.split("_");
        const id = notification.senderId;
        const contactType = type === "group" ? "group" : type === "user-mentor" ? "user-mentor" : "user-user";
        navigate(`/chat/${contactType}/${id}`);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast.error("Failed to process notification.");
    }
  };

  const handleChatClick = async () => {
    if (!currentUser || currentUser.role === "admin") {
      navigate("/login");
      return;
    }
    try {
      const unreadChatNotifications = chatNotifications.filter((n) => n.status === "unread");
      for (const notification of unreadChatNotifications) {
        await markNotificationService(notification._id, currentUser._id);
        dispatch(markNotificationAsRead(notification._id));
        socketService.markNotificationAsRead(notification._id, currentUser._id);
      }
      navigate("/chat");
    } catch (error) {
      console.error("Error marking chat notifications as read:", error);
      toast.error("Failed to mark chat notifications as read.");
    }
  };

  const handleLogout = async () => {
    if (!currentUser) return;
    const email = currentUser.email;
    try {
      await logout(email);
      dispatch(signOut());
      localStorage.removeItem("userId");
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Logout failed");
      console.log("Logout Failed:", err.response?.data?.message);
    }
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/profile");
  };

  const handleBecomeMentor = async () => {
    if (!currentUser) {
      toast.error("Please log in to apply as a mentor.");
      navigate("/login");
      return;
    }
    try {
      const profileResponse = await checkProfile(currentUser._id);
      const isProfileComplete = profileResponse.isProfileComplete;

      if (!isProfileComplete) {
        toast.error("Please complete your profile to become a mentor.");
        navigate("/complete-profile", { replace: true });
        return;
      }

      const mentorResponse = await checkMentorProfile(currentUser._id);
      const mentor = mentorResponse.mentor;

      if (!mentor) {
        navigate("/mentorProfile");
      } else {
        switch (mentor.isApproved) {
          case "Processing":
            toast.success("Your mentor request is under review.");
            break;
          case "Completed":
            toast.success("You are an approved mentor!");
            navigate("/profile");
            break;
          case "Rejected":
            toast.error("Your mentor application was rejected.");
            break;
          default:
            toast.error("Unknown status. Please contact support.");
        }
      }
    } catch (error) {
      toast.error("Error checking mentor status.");
      console.log("Error checking mentor status:", error);
    }
  };

  const safeTaskNotifications = Array.isArray(taskNotifications) ? taskNotifications : [];

  if (loading) {
    return null;
  }

  return (
    <Navbar
      className="bg-white shadow-md z-[200]"
      maxWidth="xl"
      height="4rem"
      isBordered
    >
      <NavbarBrand>
        <ConnectSphereLogo />
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Link
            href="/"
            color="foreground"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/about"
            color="foreground"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/explorementor"
            color="foreground"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Explore
          </Link>
        </NavbarItem>
        {showNotifications && (
          <NavbarItem>
            <Badge
              content={chatUnreadCount}
              color="danger"
              isInvisible={chatUnreadCount === 0}
              placement="top-right"
            >
              <Link
                href="/chat"
                color="foreground"
                className="text-sm font-medium hover:text-primary transition-colors"
                onPress={handleChatClick}
              >
                Chat
              </Link>
            </Badge>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        {currentUser ? (
          <>
            {showNotifications && (
              <NavbarItem>
                <Dropdown placement="bottom-end" closeOnSelect={false}>
                  <DropdownTrigger>
                    <Badge
                      content={taskUnreadCount}
                      color="danger"
                      isInvisible={taskUnreadCount === 0}
                      placement="top-right"
                    >
                      <Button
                        isIconOnly
                        variant="light"
                        aria-label="Notifications"
                        className="text-gray-600 hover:text-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </Button>
                    </Badge>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Notifications" variant="flat">
                    {safeTaskNotifications.length === 0 ? (
                      <DropdownItem key="no-notifications" isReadOnly>
                        No new notifications
                      </DropdownItem>
                    ) : (
                      safeTaskNotifications
                        .filter((n) => n.status === "unread")
                        .map((notification) => (
                          <DropdownItem
                            key={notification._id}
                            onPress={() => handleNotificationClick(notification)}
                            description={new Date(notification.createdAt).toLocaleTimeString()}
                            className="max-w-xs truncate"
                          >
                            {notification.content}
                          </DropdownItem>
                        ))
                    )}
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            )}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  color="primary"
                  size="sm"
                  src={currentUser.profilePic}
                  className="transition-transform hover:scale-105"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="profile" onPress={handleProfileClick}>
                  Profile
                </DropdownItem>
                {currentUser.role !== "admin" && (
                  <DropdownItem key="become-mentor" onPress={handleBecomeMentor}>
                    Become a Mentor
                  </DropdownItem>
                )}
                <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onPress={() => navigate("/login")}
            className="font-medium"
          >
            Login
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default Header;