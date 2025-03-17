import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { RootState } from "../../../redux/store";
import {
  create_task,
  delete_task,
  edit_task,
  get_tasks_by_context,
  update_task_priority,
  update_task_status,
} from "../../../Service/Task.Service";
import { registerSW, sendSubscriptionToServer, subcribeTOSW } from "../../../Service/NotificationService";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskViewModal from "./TaskViewModal";

interface ITaskData {
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  dueDate: string;
  notificationDate: string;
  notificationTime: string;
  privacy: "private";
  status: "pending" | "in-progress" | "completed" | "not-completed";
  assignedGroups: Set<string>;
  assignedCollaborations: Set<string>;
  taskImage: File | null;
  taskImagePreview: string;
}

interface ITaskErrors {
  name?: string;
  description?: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  notificationDate?: string;
  notificationTime?: string;
  taskImage?: string;
}

const TaskManagement = ({ context, currentUser, contextData }) => {
  const { collabDetails, groupMemberships } = useSelector((state: RootState) => state.profile);
  const collaborations = collabDetails?.data || [];
  const groups = groupMemberships || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my-tasks");
  const [tasks, setTasks] = useState<any[]>([]);
  const [assignedByOthers, setAssignedByOthers] = useState<any[]>([]);
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [showCollabSelect, setShowCollabSelect] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<ITaskErrors>({});

  const [taskData, setTaskData] = useState<ITaskData>({
    name: "",
    description: "",
    priority: "medium",
    startDate: "",
    dueDate: "",
    notificationDate: "",
    notificationTime: "",
    privacy: "private",
    status: "pending",
    assignedGroups: new Set([]),
    assignedCollaborations: new Set([]),
    taskImage: null,
    taskImagePreview: "",
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const validateForm = (): ITaskErrors => {
    const newErrors: ITaskErrors = {};
    if (!taskData.name.trim()) newErrors.name = "Task name is required";
    else if (taskData.name.length < 2) newErrors.name = "Task name must be at least 2 characters";
    else if (taskData.name.length > 100) newErrors.name = "Task name cannot exceed 100 characters";

    if (!taskData.description.trim()) newErrors.description = "Task description is required";
    else if (taskData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    else if (taskData.description.length > 500) newErrors.description = "Description cannot exceed 500 characters";

    if (!["low", "medium", "high"].includes(taskData.priority)) newErrors.priority = "Priority must be low, medium, or high";
    if (!taskData.startDate) newErrors.startDate = "Start date is required";
    if (!taskData.dueDate) newErrors.dueDate = "Due date is required";
    else if (taskData.startDate && taskData.dueDate) {
      const startDate = new Date(taskData.startDate);
      const dueDate = new Date(taskData.dueDate);
      if (startDate >= dueDate) newErrors.dueDate = "Due date must be after start date";
    }
    if (!taskData.notificationDate) newErrors.notificationDate = "Notification date is required";
    else if (taskData.startDate && taskData.dueDate && taskData.notificationDate) {
      const notificationDate = new Date(taskData.notificationDate);
      const startDate = new Date(taskData.startDate);
      const dueDate = new Date(taskData.dueDate);
      if (notificationDate < startDate) newErrors.notificationDate = "Notification date cannot be before start date";
      else if (notificationDate > dueDate) newErrors.notificationDate = "Notification date cannot be after due date";
    }
    if (!taskData.notificationTime) newErrors.notificationTime = "Notification time is required";
    return newErrors;
  };

  const handleInputChange = (field: keyof ITaskData, value: any) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
    const newErrors = validateForm();
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, taskImage: "Only JPEG, JPG, and PNG images are allowed" }));
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setTaskData({ ...taskData, taskImage: file, taskImagePreview: imageUrl });
      setErrors((prev) => ({ ...prev, taskImage: undefined }));
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await get_tasks_by_context(context, contextData?._id);
      if (response) {
        setTasks(response.filter((task) => task.createdBy._id === currentUser._id));
        setAssignedByOthers(response.filter((task) => task.createdBy._id !== currentUser._id));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [context, currentUser, contextData]);

  const handleTaskCreate = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const formData = new FormData();
      const { taskImage, taskImagePreview, ...filteredTaskData } = taskData;

      let autoStatus = filteredTaskData.status;
      const today = new Date();
      const startDate = new Date(filteredTaskData.startDate);
      const dueDate = new Date(filteredTaskData.dueDate);
      if (startDate > today) autoStatus = "pending";
      else if (startDate <= today && today <= dueDate) autoStatus = "in-progress";
      else if (today > dueDate) autoStatus = "not-completed";

      const newTask = {
        ...filteredTaskData,
        status: autoStatus,
        createdBy: currentUser._id,
        createdAt: new Date(),
        contextId: context === "profile" ? currentUser._id : contextData?._id,
        contextType: context,
        assignedGroups: showGroupSelect ? Array.from(taskData.assignedGroups) : [],
        assignedCollaborations: showCollabSelect ? Array.from(taskData.assignedCollaborations) : [],
      };

      formData.append("taskData", JSON.stringify(newTask));
      if (taskData.taskImage) formData.append("image", taskData.taskImage);

      const response = await create_task(currentUser._id, formData);
      const newTaskData = response.task;

      if (response) {
        toast.success("Task created successfully!");
        setIsOpen(false);
        resetForm();
        fetchTasks();

        const subscriptionResult = await handleSubscribe(newTaskData);
        if (subscriptionResult?.success) toast.success("Notification subscribed successfully");
        else toast.error("Failed to subscribe to notification");
      }
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    }
  };

  const convertTo24HourFormat = (timeStr: string) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
    if (!match) return null;
    let [_, hours, minutes, period] = match;
    let hoursInt = parseInt(hours, 10);
    if (period?.toUpperCase() === "PM" && hoursInt !== 12) hoursInt += 12;
    else if (period?.toUpperCase() === "AM" && hoursInt === 12) hoursInt = 0;
    return `${hoursInt.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleSubscribe = async (taskData: any) => {
    try {
      await registerSW();
      if (!taskData?.notificationDate || !taskData?.notificationTime) return { success: false };
      const notificationTime24 = convertTo24HourFormat(taskData.notificationTime);
      if (!notificationTime24) return { success: false };
      const dateTimeString = `${taskData.notificationDate}T${notificationTime24}:00`;
      const notificationDateTime = new Date(dateTimeString);
      if (isNaN(notificationDateTime.getTime())) return { success: false };

      const notifPermission = await Notification.requestPermission();
      if (notifPermission !== "granted") {
        toast.error("Please allow notification permission");
        return { success: false };
      }

      const subscription = await subcribeTOSW();
      if (subscription) {
        await sendSubscriptionToServer(subscription, { notificationDateTime: notificationDateTime.toISOString() }, taskData, currentUser._id);
        return { success: true, message: "Notification set" };
      }
      return { success: false };
    } catch (error) {
      console.error("Subscription failed:", error);
      return { success: false };
    }
  };

  const handleTaskUpdate = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      if (!selectedTask) return;
      const { taskImage, taskImagePreview, ...updates } = taskData;

      let autoStatus = updates.status;
      if (autoStatus !== selectedTask.status) {
        // Keep manual status change
      } else {
        const today = new Date();
        const startDate = new Date(updates.startDate);
        const dueDate = new Date(updates.dueDate);
        if (startDate > today) autoStatus = "pending";
        else if (startDate <= today && today <= dueDate) autoStatus = "in-progress";
        else if (today > dueDate && autoStatus !== "completed") autoStatus = "not-completed";
      }

      const updatedTask = {
        ...updates,
        status: autoStatus,
        assignedGroups: showGroupSelect ? Array.from(taskData.assignedGroups) : [],
        assignedCollaborations: showCollabSelect ? Array.from(taskData.assignedCollaborations) : [],
      };

      const response = await edit_task(selectedTask._id, updatedTask);
      if (response) {
        toast.success("Task updated successfully!");
        setIsEditOpen(false);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Error updating task:", error);
    }
  };

  const handleTaskDelete = async () => {
    try {
      if (!selectedTask) return;
      const response = await delete_task(selectedTask._id);
      if (response) {
        toast.success("Task deleted successfully!");
        setIsViewOpen(false);
        setIsDeleting(false);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await update_task_status(taskId, newStatus);
      if (response) {
        toast.success(`Task marked as ${newStatus}`);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to update task status");
      console.error("Error updating task status:", error);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    try {
      const response = await update_task_priority(taskId, newPriority);
      if (response) {
        toast.success(`Priority updated to ${newPriority}`);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to update task priority");
      console.error("Error updating task priority:", error);
    }
  };

  const openEditModal = (task: any) => {
    setSelectedTask(task);
    setErrors({});
    setTaskData({
      name: task.name || "",
      description: task.description || "",
      priority: task.priority || "medium",
      startDate: formatDate(task.startDate),
      dueDate: formatDate(task.dueDate),
      notificationDate: formatDate(task.notificationDate),
      notificationTime: task.notificationTime || "",
      privacy: task.privacy || "private",
      status: task.status || "pending",
      assignedGroups: new Set(task.assignedGroups || []),
      assignedCollaborations: new Set(task.assignedCollaborations || []),
      taskImage: null,
      taskImagePreview: task.image || "",
    });
    setShowGroupSelect(task.assignedGroups && task.assignedGroups.length > 0);
    setShowCollabSelect(task.assignedCollaborations && task.assignedCollaborations.length > 0);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTaskData({
      name: "",
      description: "",
      priority: "medium",
      startDate: "",
      dueDate: "",
      notificationDate: "",
      notificationTime: "",
      privacy: "private",
      status: "pending",
      assignedGroups: new Set([]),
      assignedCollaborations: new Set([]),
      taskImage: null,
      taskImagePreview: "",
    });
    setShowGroupSelect(false);
    setShowCollabSelect(false);
    setErrors({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Button color="primary" startContent={<FaPlus />} onPress={() => { resetForm(); setIsOpen(true); }}>
          Add New Task
        </Button>
      </div>

      <TaskList
        tasks={tasks}
        assignedByOthers={assignedByOthers}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        onViewTask={(task) => { setSelectedTask(task); setIsViewOpen(true); }}
        onEditTask={openEditModal}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        formatDate={formatDate}
      />

      {/* Create Task Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalBody>
            <TaskForm
              taskData={taskData}
              errors={errors}
              groups={groups}
              collaborations={collaborations}
              showGroupSelect={showGroupSelect}
              showCollabSelect={showCollabSelect}
              context={context}
              isEditMode={false}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              setShowGroupSelect={setShowGroupSelect}
              setShowCollabSelect={setShowCollabSelect}
              onSubmit={handleTaskCreate}
              onCancel={() => setIsOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalBody>
            <TaskForm
              taskData={taskData}
              errors={errors}
              groups={groups}
              collaborations={collaborations}
              showGroupSelect={showGroupSelect}
              showCollabSelect={showCollabSelect}
              context={context}
              isEditMode={true}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              setShowGroupSelect={setShowGroupSelect}
              setShowCollabSelect={setShowCollabSelect}
              onSubmit={handleTaskUpdate}
              onCancel={() => setIsEditOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Task Modal */}
      <TaskViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={selectedTask}
        onEdit={() => { setIsViewOpen(false); openEditModal(selectedTask); }}
        onDelete={handleTaskDelete}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        formatDate={formatDate}
        groups={groups}
        collaborations={collaborations}
      />
    </div>
  );
};

export default TaskManagement;