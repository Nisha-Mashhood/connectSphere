import React from "react";
import TaskCard from "./TaskCard";
import { Notification } from "../../../types";
import { User } from "../../../redux/types";
import { Task } from "../../../Interface/User/Itask";

interface TaskListProps {
  tasks: Task[];
  currentUser: User;
  notifications: Notification[];
  connectedUsers: { userId: string; name: string }[];
  context: string;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
  formatDate: (dateString: string) => string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUser,
  notifications,
  connectedUsers,
  context,
  onViewTask,
  onEditTask,
  onStatusChange,
  onPriorityChange,
  formatDate,
}) => {
  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">No tasks available</div>
      ) : (
        tasks.map((task) => {
          const hasUnreadNotification = notifications.some(
            (n) => n.relatedId === task.id && n.status === "unread" && n.type === "task_reminder"
          );
          return (
            <div
              key={task.id}
              className={`transition-all duration-200 ${
                hasUnreadNotification
                  ? "border-2 border-blue-600 rounded-lg p-1 shadow-md"
                  : ""
              }`}
            >
              <TaskCard
                task={task}
                currentUser={currentUser}
                connectedUsers={connectedUsers}
                context={context}
                onView={() => onViewTask(task)}
                onEdit={() => onEditTask(task)}
                onStatusChange={onStatusChange}
                onPriorityChange={onPriorityChange}
                formatDate={formatDate}
                hasUnreadNotification={hasUnreadNotification}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default TaskList;