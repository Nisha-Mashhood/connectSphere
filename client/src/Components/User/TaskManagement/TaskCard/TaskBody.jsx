import { Chip } from "@nextui-org/react";
import { FaCalendar } from "react-icons/fa";

export default function TaskBody({ task, formatDate }) {
  const getStatusColor = (s) =>
    ({ pending: "warning", "in-progress": "primary", completed: "success", "not-completed": "danger" }[s] || "default");

  const getPriorityColor = (p) =>
    ({ low: "success", medium: "warning", high: "danger" }[p] || "default");

  const getEmoji = (s) =>
    ({ pending: "⏳", "in-progress": "🚀", completed: "✓", "not-completed": "✗" }[s] || "");

  return (
    <div className="space-y-3">
      {/* Description */}
      <div className="rounded-xl p-3 bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-700 line-clamp-2">
          {task.description || <span className="text-gray-400 italic">No description provided</span>}
        </p>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        <Chip color={getStatusColor(task.status)} variant="flat">
          {getEmoji(task.status)} {task.status}
        </Chip>

        <Chip color={getPriorityColor(task.priority)} variant="shadow">
          {task.priority} Priority
        </Chip>

        <Chip
          variant="flat"
          className="bg-blue-50 text-blue-700 border border-blue-200"
          startContent={<FaCalendar className="text-blue-500 text-xs" />}
        >
          Due: {formatDate(task.dueDate)}
        </Chip>
      </div>
    </div>
  );
}
