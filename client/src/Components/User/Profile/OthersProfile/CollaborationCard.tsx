import { CollabData } from "../../../../redux/types";
import { Avatar, Chip } from "@nextui-org/react";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

const getCollabStatus = (collab: CollabData): { label: string; color: "success" | "warning" | "danger" } => {
  if (collab.isCompleted) {
    return { label: "Completed", color: "success" };
  }
  if (collab.isCancelled) {
    return { label: "Cancelled", color: "danger" };
  }
  return { label: "Ongoing", color: "warning" };
};

export const CollaborationCard = ({
  collab,
  isMentor,
  onProfileClick,
}: {
  collab: CollabData;
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}) => {
  const otherPerson = isMentor ? collab.user : collab.mentor?.user;
  const otherPersonId = isMentor ? collab.user?.id : collab.mentor?.user?.id;
  const { label: statusLabel, color: statusColor } = getCollabStatus(collab);

  return (
    <div className="p-5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md group">
      <div className="flex items-center gap-4">
        <Avatar
          src={otherPerson?.profilePic}
          name={otherPerson?.name?.charAt(0) || "?"}
          className="w-14 h-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => otherPersonId && onProfileClick(otherPersonId)}
          classNames={{
            base: "bg-primary-100",
            name: "text-primary font-semibold text-lg",
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p
              className="font-semibold text-gray-800 hover:text-primary cursor-pointer transition-colors text-lg"
              onClick={() => otherPersonId && onProfileClick(otherPersonId)}
            >
              {otherPerson?.name || "Unknown"}
            </p>
            <Chip
              size="sm"
              variant="flat"
              color="default"
              startContent={isMentor ? <FaUserGraduate className="text-xs" /> : <FaChalkboardTeacher className="text-xs" />}
            >
              {isMentor ? "Mentee" : "Mentor"}
            </Chip>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Chip size="sm" variant="flat" color={statusColor}>
              {statusLabel}
            </Chip>
            <span className="text-sm text-gray-600">
              Started: {new Date(collab.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};