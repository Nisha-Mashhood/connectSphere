import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Logo from "../../../assets/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { RootState } from "../../../redux/store";
import { checkProfile, logout } from "../../../Service/Auth.service";
import { checkMentorProfile } from "../../../Service/Mentor.Service";
// import { useEffect } from "react";

export const ConnectSphereLogo = () => {
  return (
    <div className="navbar-logo h-5 w-20">
      <img src={Logo} alt="Logo" />
    </div>
  );
};
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const location = useLocation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  // useEffect(() => {
    // if (
    //   (currentUser && location.pathname === "/login") ||
    //   location.pathname === "/signup" ||
    //   location.pathname === "/forgot" ||
    //   location.pathname === "/otp" ||
    //   location.pathname === "/reset"
    // ) {
    //   navigate("/", { replace: true });
    // }
  // }, [currentUser, location.pathname, navigate]);

  const handleLogout = async () => {
    const email = currentUser?.email;
    try {
      logout(email);
      dispatch(signOut());
      toast.success("Logout successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout Failed");
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
      // Step 1: Check if the profile is complete

      const profileResponse = await checkProfile(currentUser._id);
      const isProfileComplete = profileResponse.isProfileComplete;
  
      if (!isProfileComplete) {
        toast.error("For becoming a mentor, you should complete your profile first.");
        navigate("/complete-profile", { replace: true });
        return;
      }
  
      // Step 2: Check if the user is already a mentor and the approval status

      const mentorResponse = await checkMentorProfile(currentUser._id);
      const mentor = mentorResponse.mentor;
      console.log(mentor);
  
      if (!mentor) {
        // If there's no mentor record, show the mentor profile form
        navigate("/mentorProfile");
      }else {
        switch (mentor.isApproved) {
          case "Processing":
            toast.success("Your mentor request is still under review.");
            break;
          case "Completed":
            toast.success("You are an approved mentor!");
            navigate("/profile");
            break;
          case "Rejected":
            toast.error("Your mentor application has been rejected.");
            break;
          default:
            toast.error("Unknown status. Please contact support.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while checking your mentor status.");
    }
  }

  return (
    <Navbar className="bg-green-100">
      <NavbarBrand>
        <ConnectSphereLogo />
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive>
          <Link color="secondary" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/explorementor">
            Explore
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Task Management
          </Link>
        </NavbarItem>
      </NavbarContent>

      {currentUser ? (
        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src={currentUser.profilePic}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                onPress={handleProfileClick}
              >
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{currentUser.name}</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="become-mentor" onPress={handleBecomeMentor}>
            Become a Mentor
          </DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      ) : (<Button color="secondary" onPress={()=>navigate('/login')}> Login</Button>)}
    </Navbar>
  );
};

export default Header;
