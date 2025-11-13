import React from "react";
import { Group } from "../../../../redux/types";
import { IndianRupee } from "lucide-react";

interface Props {
  group: Group;
  onBack: () => void;
  onDelete: () => void;
}

const GroupHeader: React.FC<Props> = ({ group, onBack, onDelete }) => (
  <div className="relative w-full">
    <div className="w-full h-48 bg-gray-200 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white hover:text-gray-200 z-10 text-lg"
        aria-label="Go back"
      >
        ←
      </button>

      {group?.coverPic ? (
        <img src={group.coverPic} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h2 className="text-2xl font-bold">{group?.name}</h2>
        <div className="flex items-center text-sm mt-1 text-gray-200">
          <IndianRupee className="w-4 h-4 mr-1" />
          <span>{group.price}</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
          onClick={onDelete}
        >
          Delete Group
        </button>
      </div>
    </div>
  </div>
);

export default GroupHeader;
