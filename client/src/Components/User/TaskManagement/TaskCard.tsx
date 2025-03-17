import React from "react";
import { Card, CardBody, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { FaListUl, FaEllipsisV, FaEdit } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";

interface TaskCardProps {
  task: any;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
  formatDate: (dateString: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onView, onEdit, onStatusChange, onPriorityChange, formatDate }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "pending": return "warning";
      case "in-progress": return "primary";
      case "not-completed": return "danger";
      default: return "default";
    }
  };

  return (
    <Card isPressable isHoverable className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {task.image ? (
              <img src={task.image} alt="Task" className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <FaListUl className="text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{task.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mt-1">{task.description}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Chip color={getPriorityColor(task.priority)} size="sm">{task.priority} Priority</Chip>
                <Chip color={getStatusColor(task.status)} size="sm">{task.status}</Chip>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-500 mb-2">Due: {formatDate(task.dueDate)}</div>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" onClick={(e) => e.stopPropagation()}>
                  <FaEllipsisV />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Task Actions"
                onAction={(key) => {
                  const keyString = String(key);
                  if (key === "edit") onEdit();
                  else if (keyString.startsWith("status-")) onStatusChange(task._id, keyString.replace("status-", ""));
                  else if (keyString.startsWith("priority-")) onPriorityChange(task._id, keyString.replace("priority-", ""));
                }}
              >
                <DropdownItem key="edit" startContent={<FaEdit />}>Edit Task</DropdownItem>
                <DropdownItem key="status-pending" startContent={<RiTimeLine />}>Mark as Pending</DropdownItem>
                <DropdownItem key="status-in-progress" startContent={<RiTimeLine />}>Mark as In-Progress</DropdownItem>
                <DropdownItem key="status-completed" startContent={<RiTimeLine />}>Mark as Completed</DropdownItem>
                <DropdownItem key="status-not-completed" startContent={<RiTimeLine />}>Mark as Not-Completed</DropdownItem>
                <DropdownItem key="priority-low" startContent={<FaListUl />}>Low Priority</DropdownItem>
                <DropdownItem key="priority-medium" startContent={<FaListUl />}>Medium Priority</DropdownItem>
                <DropdownItem key="priority-high" startContent={<FaListUl />}>High Priority</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TaskCard;