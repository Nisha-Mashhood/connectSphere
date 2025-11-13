import React from "react";
import { Card, CardBody, Avatar, Chip, Select, SelectItem } from "@nextui-org/react";
import { FaUserTie } from "react-icons/fa";
import { User, UserRole } from "../../../redux/types";

interface Props {
  user: User;
  updateUserRole: (role: UserRole) => void;
}

const UserProfileCard: React.FC<Props> = ({ user, updateUserRole }) => {
  return (
    <Card className="h-fit shadow-lg border border-gray-200">
      <CardBody className="p-8 text-center space-y-6">
        <div className="relative inline-block">
          <Avatar
            src={user.profilePic || "/default-profile.png"}
            className="w-40 h-40 text-large"
            isBordered
            color="primary"
          />
          <Chip
            color={user.isBlocked ? "danger" : "success"}
            variant="flat"
            size="sm"
            className="absolute -bottom-2 -right-2 shadow-md"
          >
            {user.isBlocked ? "Blocked" : "Active"}
          </Chip>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500 mt-1">{user.jobTitle || "No job title"}</p>
        </div>

        {/* Role Selector */}
        <Select
          label="User Role"
          selectedKeys={[user.role]}
          onChange={(e) => updateUserRole(e.target.value as UserRole)}
          startContent={<FaUserTie className="text-gray-400" />}
          className="max-w-xs mx-auto"
          variant="bordered"
          color="primary"
        >
          <SelectItem key="user">User</SelectItem>
          <SelectItem key="mentor">Mentor</SelectItem>
          <SelectItem key="admin">Admin</SelectItem>
        </Select>
      </CardBody>
    </Card>
  );
};

export default React.memo(UserProfileCard);