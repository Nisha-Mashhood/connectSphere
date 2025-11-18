import { Button, Badge } from "@nextui-org/react";
import { FaEye, FaEdit, FaBell, FaUser, FaUsers } from "react-icons/fa";

export default function TaskHeader({
  task,
  currentUser,
  context,
  onView,
  onEdit,
  hasUnread,
}) {
  const isCreator = task.createdBy === currentUser.id;

  const assigneeNames =
    context === "user" && task.assignedUsersDetails?.length
      ? task.assignedUsersDetails.map((u) => u.name).join(", ")
      : "None";

  return (
    <div className="flex gap-4 pb-3">
      {task.image && (
        <Badge
          content={<FaBell className="text-xs" />}
          placement="top-left"
          isInvisible={!hasUnread}
          color="warning"
          size="sm"
          className="animate-pulse"
        >
          <div className="relative rounded-xl w-20 h-20 overflow-hidden shadow-md group-hover:shadow-lg">
            <img
              src={task.image}
              alt="Task"
              className="w-full h-full object-cover"
            />
          </div>
        </Badge>
      )}

      {/* Title + Buttons + Creator + Assignee */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
            {task.name}
          </h3>
          <div className="flex gap-1">
            <Button isIconOnly size="sm" variant="flat" color="primary" onPress={onView}>
              <FaEye />
            </Button>
            <Button isIconOnly size="sm" variant="flat" color="warning" onPress={onEdit}>
              <FaEdit />
            </Button>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <FaUser className="text-gray-500 text-[10px]" />
            <span className="font-medium">Creator:</span>
            <span className={isCreator ? "text-blue-600 font-semibold" : ""}>
              {isCreator ? "You" : task.createdByDetails?.name || "Unknown"}
            </span>
          </div>
        </div>

        {/* Assignees (only for user context) */}
        {context === "user" && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1 bg-cyan-50 rounded-full px-2 py-1">
              <FaUsers className="text-cyan-600 text-[10px]" />
              <span className="font-medium">Assigned:</span>
              <span className="text-cyan-700 font-medium">
                {assigneeNames}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
