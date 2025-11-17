import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Select,
  SelectItem,
  Badge,
} from "@nextui-org/react";
import { FaEye, FaEdit, FaBell, FaUser, FaUsers, FaCalendar } from "react-icons/fa";
import { User } from "../../../redux/types";
import { Task } from "../../../Interface/User/Itask";

interface TaskCardProps {
  task: Task;
  currentUser: User;
  connectedUsers: { userId: string; name: string }[];
  context: string;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
  formatDate: (dateString: string) => string;
  hasUnreadNotification?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  connectedUsers,
  context,
  onView,
  onEdit,
  onStatusChange,
  onPriorityChange,
  formatDate,
  hasUnreadNotification,
}) => {
  const isCreator = task.createdBy === currentUser?.id;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "in-progress":
        return "primary";
      case "completed":
        return "success";
      case "not-completed":
        return "danger";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "⏳";
      case "in-progress":
        return "🚀";
      case "completed":
        return "✓";
      case "not-completed":
        return "✗";
      default:
        return "";
    }
  };

  const getCreatedByDisplay = () => {
    if (isCreator) {
      return "You";
    }
    return task.createdByDetails?.name || "Unknown";
  };

  const getAssigneeDisplay = () => {
    if (context !== "user") {
      return null;
    }

    if (!task.assignedUsers?.length) {
      return "None";
    }

    const assigneeNames = task.assignedUsersDetails
      .map((user) => user.name || connectedUsers.find((u) => u.userId === user.id)?.name)
      .filter((name: string) => name && name !== "Unknown");

    return assigneeNames.length > 0
      ? assigneeNames.join(", ")
      : "None";
  };

  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group">
      <CardHeader className="flex gap-4 pb-3">
        {/* Image Section with Notification Badge */}
        {task.image && (
          <div className="relative flex-shrink-0">
            <Badge
              content={<FaBell className="text-xs" />}
              placement="top-left"
              isInvisible={!hasUnreadNotification}
              color="warning"
              size="sm"
              className="animate-pulse"
            >
              <div className="relative overflow-hidden rounded-xl w-20 h-20 shadow-md group-hover:shadow-lg transition-shadow">
                <img
                  src={task.image}
                  alt="Task"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Badge>
          </div>
        )}

        {/* Title and Actions Section */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
              {task.name}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              <Button 
                isIconOnly 
                color="primary" 
                variant="flat" 
                size="sm"
                onPress={onView}
                className="hover:scale-110 transition-transform"
              >
                <FaEye />
              </Button>
              <Button 
                isIconOnly 
                color="warning" 
                variant="flat" 
                size="sm"
                onPress={onEdit}
                className="hover:scale-110 transition-transform"
              >
                <FaEdit />
              </Button>
            </div>
          </div>

          {/* Creator and Assignee Info */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2.5 py-1">
                <FaUser className="text-gray-500 text-[10px]" />
                <span className="font-medium">Creator:</span>
                <span className={isCreator ? "text-blue-600 font-semibold" : ""}>
                  {getCreatedByDisplay()}
                </span>
              </div>
            </div>

            {context === "user" && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex items-center gap-1.5 bg-cyan-50 rounded-full px-2.5 py-1">
                  <FaUsers className="text-cyan-600 text-[10px]" />
                  <span className="font-medium">Assigned:</span>
                  <span className="text-cyan-700 font-medium">
                    {getAssigneeDisplay()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0 pb-3 space-y-3">
        {/* Description */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {task.description || <span className="text-gray-400 italic">No description provided</span>}
          </p>
        </div>

        {/* Status, Priority, and Due Date Chips */}
        <div className="flex flex-wrap gap-2">
          <Chip 
            color={getStatusColor(task.status)} 
            size="md"
            variant="flat"
            className="font-medium"
          >
            {getStatusEmoji(task.status)} {task.status}
          </Chip>
          <Chip 
            color={getPriorityColor(task.priority)} 
            size="md"
            variant="shadow"
            className="font-medium"
          >
            {task.priority} Priority
          </Chip>
          <Chip 
            variant="flat" 
            size="md"
            className="bg-blue-50 text-blue-700 font-medium border border-blue-200"
            startContent={<FaCalendar className="text-blue-500 text-xs" />}
          >
            Due: {formatDate(task.dueDate)}
          </Chip>
        </div>
      </CardBody>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-gray-100">
        {/* Status Update */}
        <div className="flex-1 w-full">
          <Select
            label="Update Status"
            placeholder="Change status"
            selectedKeys={[task.status]}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            size="sm"
            variant="bordered"
            classNames={{
              trigger: "border-2 hover:border-blue-400 transition-colors",
              label: "font-semibold text-gray-700"
            }}
          >
            <SelectItem key="pending" value="pending" textValue="pending">
              <div className="flex items-center gap-2">
                <Chip color="warning" size="sm" variant="flat">⏳ Pending</Chip>
              </div>
            </SelectItem>
            <SelectItem key="in-progress" value="in-progress" textValue="in-progress">
              <div className="flex items-center gap-2">
                <Chip color="primary" size="sm" variant="flat">🚀 In Progress</Chip>
              </div>
            </SelectItem>
            <SelectItem key="completed" value="completed" textValue="completed">
              <div className="flex items-center gap-2">
                <Chip color="success" size="sm" variant="flat">✓ Completed</Chip>
              </div>
            </SelectItem>
            <SelectItem key="not-completed" value="not-completed" textValue="not-completed">
              <div className="flex items-center gap-2">
                <Chip color="danger" size="sm" variant="flat">✗ Not Completed</Chip>
              </div>
            </SelectItem>
          </Select>
        </div>

        {/* Priority Update */}
        <div className="flex-1 w-full">
          <Select
            label="Update Priority"
            placeholder="Change priority"
            selectedKeys={[task.priority]}
            onChange={(e) => onPriorityChange(task.id, e.target.value)}
            size="sm"
            variant="bordered"
            classNames={{
              trigger: "border-2 hover:border-orange-400 transition-colors",
              label: "font-semibold text-gray-700"
            }}
          >
            <SelectItem key="low" value="low" textValue="low">
              <div className="flex items-center gap-2">
                <Chip color="success" size="sm" variant="flat">Low</Chip>
              </div>
            </SelectItem>
            <SelectItem key="medium" value="medium" textValue="medium">
              <div className="flex items-center gap-2">
                <Chip color="warning" size="sm" variant="flat">Medium</Chip>
              </div>
            </SelectItem>
            <SelectItem key="high" value="high" textValue="high">
              <div className="flex items-center gap-2">
                <Chip color="danger" size="sm" variant="flat">High</Chip>
              </div>
            </SelectItem>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;