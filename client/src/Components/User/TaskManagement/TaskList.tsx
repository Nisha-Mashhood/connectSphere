import React from "react";
import { Tabs, Tab, Chip } from "@nextui-org/react";
import { MdAssignment } from "react-icons/md";
import { BsPersonCheck } from "react-icons/bs";
import { FaArrowUp, FaHourglassHalf, FaListUl, FaTimes } from "react-icons/fa";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: any[];
  assignedByOthers: any[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  onViewTask: (task: any) => void;
  onEditTask: (task: any) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
  formatDate: (dateString: string) => string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  assignedByOthers,
  selectedTab,
  setSelectedTab,
  onViewTask,
  onEditTask,
  onStatusChange,
  onPriorityChange,
  formatDate,
}) => {
  const getUpcomingTasks = (taskList: any[]) =>
    taskList.filter((task) => new Date(task.startDate) > new Date() && (task.status === "pending" || task.status === "in-progress"));

  const getPendingTasks = (taskList: any[]) =>
    taskList.filter((task) => {
      const startDate = new Date(task.startDate);
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return startDate <= today && today <= dueDate && (task.status === "pending" || task.status === "in-progress");
    });

  const renderTabContent = (taskList: any[], filterType: "upcoming" | "pending" | "completed" | "not-completed") => {
    let filteredTasks = taskList;
    if (filterType === "upcoming") filteredTasks = getUpcomingTasks(taskList);
    else if (filterType === "pending") filteredTasks = getPendingTasks(taskList);
    else if (filterType === "completed") filteredTasks = taskList.filter((task) => task.status === "completed");
    else if (filterType === "not-completed") filteredTasks = taskList.filter((task) => task.status === "not-completed");

    return filteredTasks.length > 0 ? (
      filteredTasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onView={() => onViewTask(task)}
          onEdit={() => onEditTask(task)}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          formatDate={formatDate}
        />
      ))
    ) : (
      <div className="text-center py-8 text-gray-500">No {filterType} tasks found</div>
    );
  };

  return (
    <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key.toString())}>
      <Tab key="my-tasks" title={<div className="flex items-center gap-2"><MdAssignment /><span>My Tasks</span></div>}>
        <Tabs aria-label="My Tasks" className="mt-2" variant="light">
          <Tab key="my-upcoming" title={<div className="flex items-center gap-2"><FaArrowUp /><span>Upcoming</span></div>}>
            <div className="mt-4">{renderTabContent(tasks, "upcoming")}</div>
          </Tab>
          <Tab key="my-pending" title={<div className="flex items-center gap-2"><FaHourglassHalf /><span>Pending</span></div>}>
            <div className="mt-4">{renderTabContent(tasks, "pending")}</div>
          </Tab>
          <Tab key="my-completed" title={<div className="flex items-center gap-2"><FaListUl /><span>Completed</span></div>}>
            <div className="mt-4">{renderTabContent(tasks, "completed")}</div>
          </Tab>
          <Tab key="my-not-completed" title={<div className="flex items-center gap-2"><FaTimes /><span>Not Completed</span></div>}>
            <div className="mt-4">{renderTabContent(tasks, "not-completed")}</div>
          </Tab>
        </Tabs>
      </Tab>
      <Tab
        key="assigned-tasks"
        title={
          <div className="flex items-center gap-2">
            <BsPersonCheck />
            <span>Assigned By Others</span>
            {assignedByOthers.length > 0 && <Chip size="sm" color="secondary">{assignedByOthers.length}</Chip>}
          </div>
        }
      >
        <Tabs aria-label="Assigned Tasks" className="mt-2" variant="light">
          <Tab key="assigned-upcoming" title={<div className="flex items-center gap-2"><FaArrowUp /><span>Upcoming</span></div>}>
            <div className="mt-4">{renderTabContent(assignedByOthers, "upcoming")}</div>
          </Tab>
          <Tab key="assigned-pending" title={<div className="flex items-center gap-2"><FaHourglassHalf /><span>Pending</span></div>}>
            <div className="mt-4">{renderTabContent(assignedByOthers, "pending")}</div>
          </Tab>
          <Tab key="assigned-completed" title={<div className="flex items-center gap-2"><FaListUl /><span>Completed</span></div>}>
            <div className="mt-4">{renderTabContent(assignedByOthers, "completed")}</div>
          </Tab>
          <Tab key="assigned-not-completed" title={<div className="flex items-center gap-2"><FaTimes /><span>Not Completed</span></div>}>
            <div className="mt-4">{renderTabContent(assignedByOthers, "not-completed")}</div>
          </Tab>
        </Tabs>
      </Tab>
    </Tabs>
  );
};

export default TaskList;