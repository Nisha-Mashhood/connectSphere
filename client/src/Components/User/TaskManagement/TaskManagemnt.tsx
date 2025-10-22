import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Tabs, Tab, Chip } from "@nextui-org/react";
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
import { getUser_UserConnections } from "../../../Service/User-User.Service";
import TaskList from "./TaskList";
import TaskForm from "../../Forms/TaskForm";
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
  assignedUsers: Set<string>;
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
  const { taskNotifications } = useSelector((state: RootState) => state.notification);
  const collaborations = collabDetails?.data || [];
  const groups = groupMemberships || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<ITaskErrors>({});
  const [connectedUsers, setConnectedUsers] = useState<{ userId: string; name: string }[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");

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
    assignedUsers: new Set([]),
    taskImage: null,
    taskImagePreview: "",
  });

  // Fetch user connections for profile context
  const fetchUserConnections = useCallback(async () => {
    try {
      const connectionsData = await getUser_UserConnections(currentUser.id);
      const users = connectionsData
        .filter((conn) => conn.requestStatus === "Accepted" && conn.connectionStatus === "Connected")
        .map((conn) => {
          const otherUser = conn.requester.id === currentUser.id ? conn.recipient : conn.requester;
          return {
            userId: otherUser.id,
            name: otherUser.name || "Unnamed User",
          };
        })
        .filter((user, index, self) => 
          user.userId && self.findIndex((u) => u.userId === user.userId) === index
        );
      setConnectedUsers(users);
    } catch (error) {
      console.error("Error fetching user connections:", error);
      toast.error("Failed to fetch user connections");
    }
  }, [currentUser.id]);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await get_tasks_by_context(context, contextData?.id, currentUser.id);
      console.log(`TASK FOR CONTEXT ${context} is:`, response);
      if (response) {
        const sortedTasks = response.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllTasks(sortedTasks);
      } else {
        console.warn("No tasks data in response");
        setAllTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
      setAllTasks([]);
    }
  }, [context, contextData?.id, currentUser.id]);

  useEffect(() => {
    fetchTasks();
    if (context === "profile") {
      fetchUserConnections();
    }
  }, [context, currentUser?.id, contextData, fetchTasks, fetchUserConnections]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const validateForm = (): ITaskErrors => {
    const newErrors: ITaskErrors = {};
    if (!taskData.name?.trim()) newErrors.name = "Task name is required";
    else if (taskData.name.length < 2) newErrors.name = "Task name must be at least 2 characters";
    else if (taskData.name.length > 100) newErrors.name = "Task name cannot exceed 100 characters";

    if (!taskData.description?.trim()) newErrors.description = "Task description is required";
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

  const handleInputChange = (field: keyof ITaskData, value) => {
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

  const handleTaskCreate = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const formData = new FormData();
      const { taskImage, ...filteredTaskData } = taskData;

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
        createdBy: currentUser.id,
        createdAt: new Date(),
        contextId: context === "profile" ? currentUser.id : contextData?.id,
        contextType: context,
        assignedUsers: context === "profile" && showUserSelect ? Array.from(taskData.assignedUsers) : [],
      };

      formData.append("taskData", JSON.stringify(newTask));
      if (taskData.taskImage) formData.append("image", taskData.taskImage);

      const response = await create_task(currentUser.id, formData);
      if (response) {
        toast.success("Task created successfully!");
        setIsOpen(false);
        resetForm();
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
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
      const { taskImage, ...updates } = taskData;

      let autoStatus = updates.status;
      if (autoStatus === selectedTask.status) {
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
        assignedUsers: context === "profile" && showUserSelect ? Array.from(taskData.assignedUsers) : [],
        assignedGroups: [],
        assignedCollaborations: [],
      };

      const response = await edit_task(selectedTask.id, updatedTask);
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
      const response = await delete_task(selectedTask.id);
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

  const openEditModal = (task) => {
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
      assignedUsers: new Set(task.assignedUsers || []),
      taskImage: null,
      taskImagePreview: task.image || "",
    });
    setShowUserSelect(context === "profile" && task.assignedUsers && task.assignedUsers.length > 0);
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
      assignedUsers: new Set([]),
      taskImage: null,
      taskImagePreview: "",
    });
    setShowUserSelect(false);
    setErrors({});
  };

  // Filter tasks by status, with "Upcoming" based on startDate
  const today = new Date();
  const upcomingTasks = allTasks.filter(
    (task) => new Date(task.startDate) > today && (task.status === "pending" || task.status === "in-progress")
  );
  const pendingTasks = allTasks.filter(
    (task) => {
      const startDate = new Date(task.startDate);
      const dueDate = new Date(task.dueDate);
      return startDate <= today && today <= dueDate && task.status === "pending";
    }
  );
  const inProgressTasks = allTasks.filter((task) => task.status === "in-progress");
  const completedTasks = allTasks.filter((task) => task.status === "completed");
  const notCompletedTasks = allTasks.filter((task) => task.status === "not-completed");

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          color="primary"
          size="sm"
          startContent={<FaPlus />}
          onPress={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>

      <Tabs
        aria-label="Task statuses"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "px-0 pt-0",
          panel: "p-3",
          tab: "py-2 text-sm",
        }}
        fullWidth
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="upcoming"
          title={
            <span className="flex items-center gap-1">
              Upcoming <Chip size="sm" color="warning" variant="flat">{upcomingTasks.length}</Chip>
            </span>
          }
        >
          <TaskList
            tasks={upcomingTasks}
            currentUser={currentUser}
            notifications={taskNotifications}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(task) => {
              setSelectedTask(task);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
        <Tab
          key="pending"
          title={
            <span className="flex items-center gap-1">
              Pending <Chip size="sm" color="warning" variant="flat">{pendingTasks.length}</Chip>
            </span>
          }
        >
          <TaskList
            tasks={pendingTasks}
            currentUser={currentUser}
            notifications={taskNotifications}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(task) => {
              setSelectedTask(task);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
        <Tab
          key="in-progress"
          title={
            <span className="flex items-center gap-1">
              In Progress <Chip size="sm" color="primary" variant="flat">{inProgressTasks.length}</Chip>
            </span>
          }
        >
          <TaskList
            tasks={inProgressTasks}
            currentUser={currentUser}
            notifications={taskNotifications}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(task) => {
              setSelectedTask(task);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
        <Tab
          key="completed"
          title={
            <span className="flex items-center gap-1">
              Completed <Chip size="sm" color="success" variant="flat">{completedTasks.length}</Chip>
            </span>
          }
        >
          <TaskList
            tasks={completedTasks}
            currentUser={currentUser}
            notifications={taskNotifications}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(task) => {
              setSelectedTask(task);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
        <Tab
          key="not-completed"
          title={
            <span className="flex items-center gap-1">
              Not Completed <Chip size="sm" color="danger" variant="flat">{notCompletedTasks.length}</Chip>
            </span>
          }
        >
          <TaskList
            tasks={notCompletedTasks}
            currentUser={currentUser}
            notifications={taskNotifications}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(task) => {
              setSelectedTask(task);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
      </Tabs>

      {/* Create Task Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader className="text-lg">Create New Task</ModalHeader>
          <ModalBody>
            <TaskForm
              taskData={taskData}
              errors={errors}
              groups={groups}
              users={connectedUsers}
              collaborations={collaborations}
              showUserSelect={showUserSelect}
              context={context}
              isEditMode={false}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              setShowUserSelect={setShowUserSelect}
              onSubmit={handleTaskCreate}
              onCancel={() => setIsOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader className="text-lg">Edit Task</ModalHeader>
          <ModalBody>
            <TaskForm
              taskData={taskData}
              errors={errors}
              groups={groups}
              users={connectedUsers}
              collaborations={collaborations}
              showUserSelect={showUserSelect}
              context={context}
              isEditMode={true}
              onInputChange={handleInputChange}
              onImageChange={handleImageChange}
              setShowUserSelect={setShowUserSelect}
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
        onEdit={() => {
          setIsViewOpen(false);
          openEditModal(selectedTask);
        }}
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