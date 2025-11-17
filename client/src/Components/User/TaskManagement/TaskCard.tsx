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
import { FaEye, FaEdit, FaBell } from "react-icons/fa";
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

  const getCreatedByDisplay = () => {
    if (isCreator) {
      return "Created By: You";
    }
    return `Created By: ${task.createdByDetails?.name || "Unknown"}`;
  };

  const getAssigneeDisplay = () => {
    if (context !== "user") {
      return null;
    }

    if (!task.assignedUsers?.length) {
      return "Assigned To: None";
    }

    const assigneeNames = task.assignedUsersDetails
      .map((user) => user.name || connectedUsers.find((u) => u.userId === user.id)?.name)
      .filter((name: string) => name && name !== "Unknown");

    return assigneeNames.length > 0
      ? `Assigned To: ${assigneeNames.join(", ")}`
      : "Assigned To: None";
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-start gap-3">
        {task.image && (
          <div className="flex-shrink-0">
            <Badge
              content={hasUnreadNotification && <FaBell className="text-yellow-500" />}
              placement="top-left"
              isInvisible={!hasUnreadNotification}
            >
              <img
                src={task.image}
                alt="Task"
                className="w-12 h-12 object-cover rounded-lg"
              />
            </Badge>
          </div>
        )}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{task.name}</h3>
            <div className="flex gap-2">
              <Button isIconOnly color="secondary" variant="light" onPress={onView}>
                <FaEye />
              </Button>
              <Button isIconOnly color="warning" variant="light" onPress={onEdit}>
                <FaEdit />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">{getCreatedByDisplay()}</p>
          {context === "user" && (
            <p className="text-sm text-gray-500">{getAssigneeDisplay()}</p>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-700 mb-2">
          Description: {task.description || "No description"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip color={getStatusColor(task.status)} size="sm">
            Status: {task.status}
          </Chip>
          <Chip color={getPriorityColor(task.priority)} size="sm">
            Priority: {task.priority}
          </Chip>
          <Chip variant="flat" size="sm">
            Due: {formatDate(task.dueDate)}
          </Chip>
        </div>
      </CardBody>
      <CardFooter className="flex gap-4">
        <Select
          label="Update Status"
          placeholder="Select status"
          selectedKeys={[task.status]}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          size="sm"
          className="w-full max-w-[200px]"
        >
          <SelectItem key="pending" value="pending">
            Pending
          </SelectItem>
          <SelectItem key="in-progress" value="in-progress">
            In Progress
          </SelectItem>
          <SelectItem key="completed" value="completed">
            Completed
          </SelectItem>
          <SelectItem key="not-completed" value="not-completed">
            Not Completed
          </SelectItem>
        </Select>
        <Select
          label="Update Priority"
          placeholder="Select priority"
          selectedKeys={[task.priority]}
          onChange={(e) => onPriorityChange(task.id, e.target.value)}
          size="sm"
          className="w-full max-w-[200px]"
        >
          <SelectItem key="low" value="low">
            Low
          </SelectItem>
          <SelectItem key="medium" value="medium">
            Medium
          </SelectItem>
          <SelectItem key="high" value="high">
            High
          </SelectItem>
        </Select>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;