// src/components/Mentor/MentorHeader.tsx
import { Card, Avatar, Button, Chip } from "@nextui-org/react";
import { FaCamera, FaPencilAlt } from "react-icons/fa";
import { User } from "../../../../redux/types";

type Props = {
  currentUser: User;
  onProfileUpload: (file: File) => void;
  onCoverUpload: (file: File) => void;
  onEdit: () => void;
};

export const MentorHeader = ({ currentUser, onProfileUpload, onCoverUpload, onEdit }: Props) => {
  return (
    <>
      {/* Cover */}
      <Card className="border-none shadow-lg overflow-hidden mb-0">
        <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
          {currentUser?.coverPic && (
            <img src={currentUser.coverPic} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 z-10">
            <label className="cursor-pointer">
              <Button isIconOnly size="sm" variant="flat" className="bg-black/20 backdrop-blur-md text-white">
                <FaCamera size={14} />
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onCoverUpload(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card className="border-none shadow-lg -mt-16 relative z-10 mx-4">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 flex-1">
              <div className="relative">
                <Avatar
                  src={currentUser?.profilePic}
                  className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-gray-100"
                  fallback={<div className="w-16 h-16 bg-gray-200 rounded-full" />}
                />
                <label className="absolute -bottom-2 -right-2 cursor-pointer">
                  <Button isIconOnly size="sm" className="w-8 h-8 bg-white border-2 border-gray-200">
                    <FaCamera size={12} />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onProfileUpload(e.target.files[0])}
                  />
                </label>
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold truncate">{currentUser?.name}</h1>
                  <Chip color="success" variant="flat">Mentor</Chip>
                </div>
                <p className="text-lg text-gray-600 font-medium">{currentUser?.jobTitle || "No job title"}</p>
              </div>
            </div>
            <Button color="primary" size="lg" startContent={<FaPencilAlt />} onPress={onEdit}>
              Edit Mentorship Details
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};