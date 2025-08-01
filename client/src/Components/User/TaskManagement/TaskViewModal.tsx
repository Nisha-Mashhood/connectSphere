import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@nextui-org/react";
import { FaCalendar, FaBell, FaEdit, FaTrash } from "react-icons/fa";

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  setIsDeleting: (value: boolean) => void;
  formatDate: (dateString: string) => string;
  groups: any[];
  collaborations: any[];
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
  groups,
  collaborations,
}) => {
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

  const renderCollaborationName = (collab) =>
    collab.userId?.name || collab.mentorId?.userId?.name || "Unnamed";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {task && (
          <>
            <ModalHeader className="flex justify-between items-center text-lg">
              <div>{task.name}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="light" color="primary" startContent={<FaEdit />} onPress={onEdit}>Edit</Button>
                <Button size="sm" variant="light" color="danger" startContent={<FaTrash />} onPress={() => setIsDeleting(true)}>Delete</Button>
              </div>
            </ModalHeader>
            <ModalBody className="p-4">
              {isDeleting ? (
                <div className="text-center py-4">
                  <h3 className="text-base font-semibold mb-3">Are you sure you want to delete this task?</h3>
                  <div className="flex justify-center gap-3">
                    <Button color="default" variant="flat" size="sm" onPress={() => setIsDeleting(false)}>Cancel</Button>
                    <Button color="danger" size="sm" onPress={onDelete}>Delete</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {task.image && <img src={task.image} alt="Task" className="w-full max-h-48 object-cover rounded-lg" />}
                  <div className="flex flex-wrap gap-2">
                    <Chip color={getPriorityColor(task.priority)} size="sm">{task.priority} Priority</Chip>
                    <Chip color={getStatusColor(task.status)} size="sm">{task.status}</Chip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm"><FaCalendar /><span>Start Date: {formatDate(task.startDate)}</span></div>
                    <div className="flex items-center gap-2 text-sm"><FaCalendar /><span>Due Date: {formatDate(task.dueDate)}</span></div>
                    {task.notificationDate && (
                      <div className="flex items-center gap-2 text-sm"><FaBell /><span>Notification: {formatDate(task.notificationDate)} at {task.notificationTime}</span></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{task.description || "No description provided."}</p>
                  </div>
                  {task.assignedGroups?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Assigned Groups</h4>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedGroups.map((groupId: string) => {
                          const group = groups.find((g) => g._id === groupId);
                          return <Chip key={groupId} color="primary" size="sm">{group?.name || "Unknown Group"}</Chip>;
                        })}
                      </div>
                    </div>
                  )}
                  {task.assignedCollaborations?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Assigned Collaborations</h4>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedCollaborations.map((collabId: string) => {
                          const collab = collaborations.find((c) => c._id === collabId);
                          return <Chip key={collabId} color="primary" size="sm">{collab ? renderCollaborationName(collab) : "Unknown Collaboration"}</Chip>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" size="sm" onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskViewModal;