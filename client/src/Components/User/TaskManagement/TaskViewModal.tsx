import React from "react";
import { Button, Chip } from "@nextui-org/react";
import { FaCalendar, FaBell, FaEdit, FaTrash, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import { Task } from "../../../Interface/User/Itask";
import BaseModal from "../../ReusableComponents/BaseModal";

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  setIsDeleting: (v: boolean) => void;
  formatDate: (dateString: string) => string;
}

const TaskViewModal: React.FC<TaskViewModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  isDeleting,
  setIsDeleting,
  formatDate,
}) => {
  if (!task) return null;

  const getPriorityColor = (p: string) =>
    p === "high" ? "danger" : p === "medium" ? "warning" : "success";

  const getStatusColor = (s: string) =>
    s === "completed"
      ? "success"
      : s === "in-progress"
      ? "primary"
      : s === "pending"
      ? "warning"
      : "danger";

  const getStatusEmoji = (s: string) =>
    s === "completed"
      ? "✓"
      : s === "in-progress"
      ? "🚀"
      : s === "pending"
      ? "⏳"
      : "✗";

  const getPriorityLabel = (p: string) =>
    p.charAt(0).toUpperCase() + p.slice(1) + " Priority";

  const getStatusLabel = (s: string) => {
    const labels = {
      completed: "Completed",
      "in-progress": "In Progress",
      pending: "Pending",
      "not-completed": "Not Completed"
    };
    return labels[s] || s;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        setIsDeleting(false);
        onClose();
      }}
      title=""
      size="lg"
      scrollBehavior="inside"
    >
      {isDeleting ? (
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">
            Delete Task?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "<span className="font-semibold">{task.name}</span>"? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              size="lg" 
              variant="flat" 
              onPress={() => setIsDeleting(false)}
              className="px-8 font-medium"
            >
              Cancel
            </Button>
            <Button 
              size="lg" 
              color="danger" 
              onPress={onDelete}
              className="px-8 font-medium shadow-lg"
            >
              Delete Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section with Title and Actions */}
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl -z-10"></div>
            
            <div className="p-6 space-y-4">
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 pr-24 break-words">
                {task.name}
              </h2>

              {/* Action Buttons - Positioned Absolutely */}
              <div className="absolute top-6 right-6 flex gap-2">
                <Button 
                  size="sm" 
                  color="primary" 
                  variant="shadow"
                  startContent={<FaEdit />} 
                  onPress={onEdit}
                  className="font-medium"
                >
                  Edit
                </Button>
                <Button 
                  isIconOnly
                  size="sm" 
                  color="danger" 
                  variant="flat" 
                  onPress={() => setIsDeleting(true)}
                  className="hover:bg-red-100"
                >
                  <FaTrash />
                </Button>
              </div>

              {/* Status and Priority Chips */}
              <div className="flex flex-wrap gap-2">
                <Chip 
                  size="md" 
                  color={getStatusColor(task.status)}
                  variant="shadow"
                  className="font-medium"
                >
                  {getStatusEmoji(task.status)} {getStatusLabel(task.status)}
                </Chip>
                <Chip 
                  size="md" 
                  color={getPriorityColor(task.priority)}
                  variant="flat"
                  className="font-medium"
                >
                  {getPriorityLabel(task.priority)}
                </Chip>
              </div>
            </div>
          </div>

          {/* Image Section */}
          {task.image && (
            <div className="relative group">
              <img
                src={task.image}
                alt="Task"
                className="w-full max-h-64 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          )}

          {/* Dates Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 space-y-3 border border-gray-200">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <FaCalendar className="text-blue-600" />
              Schedule
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCalendar className="text-green-600 text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(task.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FaCalendar className="text-red-600 text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            </div>

            {task.notificationDate && (
              <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border-2 border-amber-200">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <FaBell className="text-amber-600 text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Notification</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(task.notificationDate)} at {task.notificationTime}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-1">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800 ml-2">Description</h4>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {task.description || (
                  <span className="text-gray-400 italic">No description provided.</span>
                )}
              </p>
            </div>
          </div>

          {/* Assigned Users Section - Only for USER context */}
          {task.contextType === "user" && (
            <div className="space-y-3">
              <div className="flex items-start gap-1">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-800 ml-2 flex items-center gap-2">
                  <FaUsers className="text-cyan-600" />
                  Assigned Users
                </h4>
              </div>

              {task.assignedUsersDetails?.length ? (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border-2 border-cyan-200">
                  <div className="flex flex-wrap gap-2">
                    {task.assignedUsersDetails.map((u) => (
                      <Chip 
                        key={u.id} 
                        size="md" 
                        color="primary" 
                        variant="flat"
                        className="font-medium shadow-sm"
                      >
                        {u.name}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    {task.assignedUsersDetails.length} {task.assignedUsersDetails.length === 1 ? 'person' : 'people'} assigned to this task
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 text-center">
                  <FaUsers className="text-gray-300 text-3xl mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No users assigned to this task</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
};

export default TaskViewModal;