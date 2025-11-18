import BaseModal from "../../../ReusableComponents/BaseModal";
import TaskViewHeader from "./TaskViewHeader";
import TaskViewImage from "./TaskViewImage";
import TaskViewSchedule from "./TaskViewSchedule";
import TaskViewAssignedUsers from "./TaskViewAssignedUsers";
import { Button } from "@nextui-org/react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function TaskViewModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  isDeleting,
  setIsDeleting,
  formatDate
}) {
  if (!task) return null;

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
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>

          <h3 className="font-bold text-xl mb-2 text-gray-800">
            Delete Task?
          </h3>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{task.name}</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <Button variant="flat" size="lg" onPress={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button size="lg" color="danger" onPress={onDelete}>
              Delete Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TaskViewHeader
            task={task}
            onEdit={onEdit}
            setIsDeleting={setIsDeleting}
          />

          <TaskViewImage image={task.image} />

          <TaskViewSchedule task={task} formatDate={formatDate} />

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-gray-700 whitespace-pre-line">
                {task.description || <i>No description provided.</i>}
              </p>
            </div>
          </div>

          {task.contextType === "user" && (
            <TaskViewAssignedUsers users={task.assignedUsersDetails} />
          )}
        </div>
      )}
    </BaseModal>
  );
}
