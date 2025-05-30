import React from "react";
import { Chip } from "@nextui-org/react";
import { FaArrowUp, FaHourglassHalf, FaListUl, FaTimes } from "react-icons/fa";
import TaskCard from "./TaskCard";
import { Notification } from "../../../types";

interface TaskListProps {
  tasks: any[];
  currentUser: any;
  notifications: Notification[];
  connectedUsers: { userId: string; name: string }[];
  context: string;
  onViewTask: (task: any) => void;
  onEditTask: (task: any) => void;
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
  const getUpcomingTasks = (taskList: any[]) =>
    taskList.filter(
      (task) =>
        new Date(task.startDate) > new Date() &&
        (task.status === "pending" || task.status === "in-progress")
    );

  const getPendingTasks = (taskList: any[]) =>
    taskList.filter((task) => {
      const startDate = new Date(task.startDate);
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return (
        startDate <= today &&
        today <= dueDate &&
        (task.status === "pending" || task.status === "in-progress")
      );
    });

  const taskSections = [
    {
      key: "upcoming",
      title: "Upcoming Tasks",
      icon: <FaArrowUp />,
      tasks: getUpcomingTasks(tasks),
    },
    {
      key: "pending",
      title: "Pending Tasks",
      icon: <FaHourglassHalf />,
      tasks: getPendingTasks(tasks),
    },
    {
      key: "completed",
      title: "Completed Tasks",
      icon: <FaListUl />,
      tasks: tasks.filter((task) => task.status === "completed"),
    },
    {
      key: "not-completed",
      title: "Not Completed Tasks",
      icon: <FaTimes />,
      tasks: tasks.filter((task) => task.status === "not-completed"),
    },
  ];

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No tasks available</div>
      ) : (
        taskSections.map((section) => (
          <div key={section.key} className="space-y-4">
            <div className="flex items-center gap-2">
              {section.icon}
              <h3 className="text-lg font-semibold">
                {section.title}
                <Chip size="sm" color="secondary" className="ml-2">
                  {section.tasks.length}
                </Chip>
              </h3>
            </div>
            {section.tasks.length > 0 ? (
              section.tasks.map((task) => {
                const hasUnreadNotification = notifications.some(
                  (n) => n.relatedId === task._id && n.status === "unread" && n.type === "task_reminder"
                );
                return (
                  <div
                    key={task._id}
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
            ) : (
              <div className="text-center py-4 text-gray-600">
                No {section.title.toLowerCase()}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;