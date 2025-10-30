import { Button } from "@nextui-org/react";
import { FaCamera } from "react-icons/fa";

type Props = {
  coverPic: string;
  isAdmin: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const GroupCover = ({ coverPic, isAdmin, onUpload }: Props) => {
  return (
    <div className="relative w-full h-64">
      <img
        src={coverPic || "/api/placeholder/1200/300"}
        alt="Cover"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      {isAdmin && (
        <div className="absolute bottom-4 right-4">
          <label className="cursor-pointer">
            <Button color="default" variant="flat" size="sm" startContent={<FaCamera />} className="bg-white/80 backdrop-blur-md">
              Change Cover
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>
      )}
    </div>
  );
};