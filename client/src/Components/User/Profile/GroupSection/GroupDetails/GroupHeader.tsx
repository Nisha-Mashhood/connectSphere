import { Avatar, Button, Chip } from "@nextui-org/react";
import { FaCamera, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Group } from "../../../../../redux/types";

type Props = {
  group: Group;
  isAdmin: boolean;
  pendingCount: number;
  onExit: () => void;
  onDelete: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const GroupHeader = ({
  group,
  isAdmin,
  pendingCount,
  onExit,
  onDelete,
  onPhotoUpload,
}: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-6 pt-6 pb-6 relative z-10">
      <div className="flex items-start md:items-center gap-6">
        <div
          className="relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Avatar src={group.profilePic || "/api/placeholder/200/200"} size="lg" className="w-24 h-24" />
          {hover && isAdmin && (
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
              <FaCamera className="text-white text-xl" />
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
            </label>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-default-500 mt-2">{group.bio}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Chip color="primary" variant="flat">{group.maxMembers} Max</Chip>
            <Chip color="secondary" variant="flat">{group.members?.length || 0} Members</Chip>
            {pendingCount > 0 && isAdmin && (
              <Chip color="warning" variant="flat">{pendingCount} Pending</Chip>
            )}
          </div>
        </div>
      </div>

      <div className="self-start mt-4 md:mt-0">
        {isAdmin ? (
          <Button color="danger" variant="flat" startContent={<FaTrash />} onClick={onDelete}>
            Delete Group
          </Button>
        ) : (
          <Button color="danger" variant="flat" startContent={<FaSignOutAlt />} onClick={onExit}>
            Exit Group
          </Button>
        )}
      </div>
    </div>
  );
};