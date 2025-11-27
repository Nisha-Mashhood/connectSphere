import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider,
} from "@nextui-org/react";
import { FaUser, FaGraduationCap, FaSignOutAlt } from "react-icons/fa";
import { User } from "../../../../redux/types";

interface Props {
  currentUser: User;
  handleProfileClick: () => void;
  handleBecomeMentor: () => void;
  handleLogout: () => void;
}

const ProfileDropdown = ({
  currentUser,
  handleProfileClick,
  handleBecomeMentor,
  handleLogout,
}: Props) => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          color="primary"
          size="sm"
          src={currentUser.profilePic}
          className="hover:scale-110 transition-transform"
          showFallback
          name={currentUser.name}
        />
      </DropdownTrigger>

      <DropdownMenu aria-label="User Actions" variant="flat" className="w-64">
        <DropdownItem isReadOnly key="user-info">
          <div className="flex items-center gap-3 py-2">
            <Avatar src={currentUser.profilePic} size="md" showFallback />
            <div>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
          <Divider />
        </DropdownItem>

        <DropdownItem
            key="profile-header"
          startContent={<FaUser />}
          onPress={handleProfileClick}
          className="py-3"
        >
          View Profile
        </DropdownItem>

        {currentUser.role !== "admin" && (
          <DropdownItem
            key="become-mentor"
            startContent={<FaGraduationCap />}
            onPress={handleBecomeMentor}
            className="py-3"
          >
            Become a Mentor
          </DropdownItem>
        )}

        <DropdownItem
          key="logout"
          color="danger"
          startContent={<FaSignOutAlt />}
          onPress={handleLogout}
          className="py-3"
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
