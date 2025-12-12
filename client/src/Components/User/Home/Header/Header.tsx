import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../../../../Hooks/User/useHeader";
import { ConnectSphereLogo } from "../../../ReusableComponents/ConnectSphereLogo";
import ChatNotificationButton from "./ChatNotificationButton";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    loading,
    unreadNotifications,
    taskUnreadCount,
    chatUnreadCount,
    dropdownOpen,
    setDropdownOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    showNotifications,
    handleNotificationClick,
    markAllNotifications,
    markSingleNotificationAsRead,
    handleChatClick,
    handleLogout,
    handleProfileClick,
    handleBecomeMentor,
    isInChatComponent,
  } = useHeader();

  if (loading) {
    return null;
  }

  return (
    <Navbar
      className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-100 z-[200]"
      maxWidth="xl"
      height="4.5rem"
    >
      <NavbarBrand className="gap-2">
        <ConnectSphereLogo />
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-10" justify="center">
        <NavbarItem>
          <Link
            href="/"
            color="foreground"
            className="text-base font-semibold hover:text-blue-600 transition-all duration-200 relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/about"
            color="foreground"
            className="text-base font-semibold hover:text-blue-600 transition-all duration-200 relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/explorementor"
            color="foreground"
            className="text-base font-semibold hover:text-blue-600 transition-all duration-200 relative group"
          >
            Explore
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </NavbarItem>
        {currentUser && showNotifications && !isInChatComponent && (
          <ChatNotificationButton
            chatUnreadCount={chatUnreadCount}
            handleChatClick={handleChatClick}
          />
        )}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        {currentUser ? (
          <>
            {showNotifications && (
              <NavbarItem>
                <NotificationDropdown
                  unreadNotifications={unreadNotifications}
                  taskUnreadCount={taskUnreadCount}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  isConfirmModalOpen={isConfirmModalOpen}
                  setIsConfirmModalOpen={setIsConfirmModalOpen}
                  handleNotificationClick={handleNotificationClick}
                  markSingleNotificationAsRead={markSingleNotificationAsRead}
                  markAllNotifications={markAllNotifications}
                  currentUserId={currentUser.id}
                />
              </NavbarItem>
            )}
            <ProfileDropdown
              currentUser={currentUser}
              handleProfileClick={handleProfileClick}
              handleBecomeMentor={handleBecomeMentor}
              handleLogout={handleLogout}
            />
          </>
        ) : (
          <Button
            color="primary"
            variant="shadow"
            size="md"
            onPress={() => navigate("/login")}
            className="font-semibold px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Login
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
