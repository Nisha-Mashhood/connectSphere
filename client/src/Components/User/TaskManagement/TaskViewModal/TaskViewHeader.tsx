import { Button, Chip } from "@nextui-org/react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TaskViewHeader({ task, onEdit, setIsDeleting }) {
  const getPriorityColor = (p) =>
    p === "high" ? "danger" : p === "medium" ? "warning" : "success";

  const getStatusColor = (s) =>
    s === "completed"
      ? "success"
      : s === "in-progress"
      ? "primary"
      : s === "pending"
      ? "warning"
      : "danger";

  const emoji = {
    completed: "✓",
    "in-progress": "🚀",
    pending: "⏳",
    "not-completed": "✗",
  };

  return (
    <div className="relative p-6 space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
      <h2 className="text-3xl font-bold text-gray-800 pr-24 break-words">
        {task.name}
      </h2>

      <div className="absolute top-6 right-6 flex gap-2">
        <Button
          size="sm"
          color="primary"
          variant="shadow"
          startContent={<FaEdit />}
          onPress={onEdit}
        >
          Edit
        </Button>
        <Button
          isIconOnly
          size="sm"
          color="danger"
          onPress={() => setIsDeleting(true)}
        >
          <FaTrash />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip color={getStatusColor(task.status)} variant="shadow">
          {emoji[task.status]} {task.status}
        </Chip>

        <Chip color={getPriorityColor(task.priority)} variant="flat">
          {task.priority} Priority
        </Chip>
      </div>
    </div>
  );
}
