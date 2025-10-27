import { FC, ReactNode } from "react";
import { FaEdit } from "react-icons/fa";

interface ProfileSectionProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

const ProfileSection: FC<ProfileSectionProps> = ({
  icon,
  title,
  subtitle,
  onClick,
}) => {
  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-500 line-clamp-2 break-words">{subtitle}</p>
          </div>
        </div>
        <FaEdit
          size={12}
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};

export default ProfileSection;
