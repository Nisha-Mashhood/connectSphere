import { Avatar, Button, Card, CardBody, Chip } from "@nextui-org/react";
import { FaCamera, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Group } from "../../../../../redux/types";

type Props = {
  group: Group;
  isAdmin: boolean;
  onDelete: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => void;
};

export const GroupHeader = ({ group, isAdmin, onDelete, onPhotoUpload }: Props) => {
  const [hoverCover, setHoverCover] = useState(false);
  const [hoverProfile, setHoverProfile] = useState(false);

  return (
    <Card className="w-full shadow-md mb-6">
      <div
        className="relative h-48 md:h-64"
        onMouseEnter={() => setHoverCover(true)}
        onMouseLeave={() => setHoverCover(false)}
      >
        <img
          src={group.coverPic || "/api/placeholder/1200/400"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {hoverCover && isAdmin && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <label className="cursor-pointer">
              <Button color="default" variant="flat" startContent={<FaCamera />}>
                Change Cover
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhotoUpload(e, "cover")}
              />
            </label>
          </div>
        )}
        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Button color="danger" variant="flat" size="sm" startContent={<FaTrash />} onPress={onDelete}>
              Delete Group
            </Button>
          </div>
        )}
        <div
          className="absolute -bottom-12 left-6"
          onMouseEnter={() => setHoverProfile(true)}
          onMouseLeave={() => setHoverProfile(false)}
        >
          <div className="relative">
            <Avatar
              src={group.profilePic || "/api/placeholder/200/200"}
              className="w-24 h-24 text-large border-4 border-white shadow-md"
            />
            {hoverProfile && isAdmin && (
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                <FaCamera className="text-white text-xl" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhotoUpload(e, "profile")}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <CardBody className="mt-12 px-6 pb-4">
        <h2 className="text-2xl font-bold">{group.name}</h2>
        <p className="text-default-500 mt-1">{group.bio}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Chip color={group.isFull ? "danger" : "secondary"} variant="flat">
            {group.members?.length || 0} / 4 Members {group.isFull && "(Full)"}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};