import { FC } from "react";
import {
  Card,
  Avatar,
  Button,
  Chip,
  Image,
} from "@nextui-org/react";
import { FaCamera, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { User } from "../../../redux/types";
import { updateUserImages } from "../../../Service/User.Service";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { AppDispatch } from "../../../redux/store";


interface ProfileHeaderProps {
  currentUser: User;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleImageUpload = async (
    file: File,
    type: "profilePic" | "coverPic"
  ) => {
    const formData = new FormData();
    formData.append(type, file);
    try {
      const { user } = await updateUserImages(currentUser.id, formData);
      dispatch(updateUserProfile(user));
      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
      console.error("Failed to update image", error);
    }
  };

  return (
    <Card className="border-none shadow-lg overflow-hidden mb-0">
      <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {currentUser?.coverPic && (
          <Image
            src={currentUser.coverPic}
            alt="Cover"
            className="w-full h-full object-cover"
            removeWrapper
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-4 right-4 z-10">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="bg-black/20 backdrop-blur-md text-white border-white/20 hover:bg-black/30"
          >
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleImageUpload(e.target.files[0], "coverPic")
                }
              />
              <FaCamera size={14} />
            </label>
          </Button>
        </div>
      </div>
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 flex-1">
            <div className="relative flex-shrink-0">
              <Avatar
                src={currentUser?.profilePic}
                className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-gray-100"
                fallback={<FaMapMarkerAlt className="w-16 h-16 text-gray-400" />}
              />
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="absolute -bottom-2 -right-2 w-8 h-8 min-w-0 bg-white border-2 border-gray-200 shadow-md hover:shadow-lg"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload(e.target.files[0], "profilePic")
                    }
                  />
                  <FaCamera size={12} />
                </label>
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  {currentUser?.name}
                </h1>
                <Chip
                  color={currentUser?.role === "mentor" ? "success" : "primary"}
                  variant="flat"
                  size="md"
                  className="w-fit"
                >
                  {currentUser?.role === "mentor" ? "Mentor" : "User"}
                </Chip>
              </div>
              <p className="text-lg text-gray-600 mb-3 font-medium">
                {currentUser?.jobTitle || "No job title"}
              </p>
            </div>
          </div>
          <Button
            color="primary"
            size="lg"
            variant="solid"
            startContent={<FaPlus size={16} />}
            onPress={() => navigate("/create-group")}
            className="font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Create Group
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;