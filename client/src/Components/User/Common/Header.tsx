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
} from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { RootState } from "../../../redux/store";
import { checkProfile, logout } from "../../../Service/Auth.service";
import { checkMentorProfile } from "../../../Service/Mentor.Service";
import Logo from "../../../assets/logoMain.jpg";

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
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    const email = currentUser?.email;
    try {
      await logout(email);
      dispatch(signOut());
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const handleProfileClick = () => {
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
    }
  };

  return (
    <Navbar
      className="bg-white shadow-md z-[200]"
      maxWidth="xl"
      height="4rem"
      isBordered
    >
      {/* Logo */}
      <NavbarBrand>
        <ConnectSphereLogo />
      </NavbarBrand>

      {/* Navigation Links */}
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
        <NavbarItem>
          <Link
            href="/chat"
            color="foreground"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Chat
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* User Actions */}
      <NavbarContent justify="end">
        {currentUser ? (
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
              <DropdownItem key="become-mentor" onPress={handleBecomeMentor}>
                Become a Mentor
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={handleLogout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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