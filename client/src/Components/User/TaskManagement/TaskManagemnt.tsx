import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tabs,
  Tab,
  Chip,
} from "@nextui-org/react";
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
import { TaskFormValues } from "../../../validation/taskValidation";
import { CollabData, Group, GroupMembership, User } from "../../../redux/types";
import { Task } from "../../../Interface/User/Itask";

interface TaskManagementProps {
  context: "user" | "group" | "collaboration";
  currentUser: User;
  contextData?: User | Group | CollabData;
}

const TaskManagement = ({ context, currentUser, contextData }: TaskManagementProps) => {
  const { collabDetails, groupMemberships } = useSelector((state: RootState) => state.profile);
  const { taskNotifications } = useSelector((state: RootState) => state.notification);

  const collaborations = collabDetails?.data || [];

  // Map GroupMembership[] → Group[]
  const groups: Group[] = (groupMemberships?.groups ?? []).map((gm: GroupMembership): Group => ({
    id: gm.id,
    groupId: gm.groupId,
    name: gm.name,
    bio: gm.bio,
    price: gm.price,
    maxMembers: gm.maxMembers,
    members: gm.members,
    membersDetails: gm.membersDetails,
    admin: gm.admin,
    adminId: gm.adminId,
    availableSlots: gm.availableSlots,
    coverPic: gm.coverPic,
    profilePic: gm.profilePic,
    startDate: gm.startDate,
    isFull: gm.isFull,
    createdAt: gm.createdAt,
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<{ userId: string; name: string }[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");
  const [showUserSelect, setShowUserSelect] = useState(false);

  // Fetch user connections (only for user context)
  const fetchUserConnections = useCallback(async () => {
    if (context !== "user") return;
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
        .filter((user, index, self) => user.userId && self.findIndex((u) => u.userId === user.userId) === index);
      setConnectedUsers(users);
    } catch (error) {
      console.error("Error fetching user connections:", error);
      toast.error("Failed to fetch user connections");
    }
  }, [currentUser.id, context]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await get_tasks_by_context(context, contextData?.id, currentUser.id);
      if (response && Array.isArray(response)) {
        const sortedTasks = response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllTasks(sortedTasks);
      } else {
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
    fetchUserConnections();
  }, [fetchTasks, fetchUserConnections]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const calculateStatus = (startDate: string, dueDate: string, currentStatus?: string): string => {
    const today = new Date();
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (currentStatus === "completed") return "completed";
    if (start > today) return "pending";
    if (today <= due) return "in-progress";
    return "not-completed";
  };

  // Handle task creation
  const handleTaskCreate = async (formData: TaskFormValues, showUserSelect: boolean) => {
    try {
      const { taskImage, ...data } = formData;
    const status = calculateStatus(data.startDate, data.dueDate);
    const assigned = context === "user" && showUserSelect ? data.assignedUsers || [] : [];

    console.log("CREATE → assignedUsers:", assigned);

    const payload = {
      ...data,
      status,
      createdBy: currentUser.id,
      contextId: context === "user" ? currentUser.id : contextData?.id,
      contextType: context,
      assignedUsers: assigned,
    };

      const formDataToSend = new FormData();
      formDataToSend.append("taskData", JSON.stringify(payload));
      if (taskImage) formDataToSend.append("image", taskImage);

      const response = await create_task(currentUser.id, formDataToSend);
      if (response){
        console.log(response)
        toast.success("Task created successfully!");
      }
      setIsOpen(false);
      setShowUserSelect(false);
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to create task");
    }
  };

  // Handle task update
  const handleTaskUpdate = async (formData: TaskFormValues, showUserSelect: boolean) => {
    if (!selectedTask) return;

    try {
      const { taskImage, ...updates } = formData;
    const status = calculateStatus(updates.startDate, updates.dueDate, updates.status);
    const assigned = context === "user" && showUserSelect ? updates.assignedUsers || [] : [];

    console.log("UPDATE → assignedUsers:", assigned);

    const payload = { 
      ...updates, 
      status,
      assignedUsers: assigned,
    };

      const formDataToSend = new FormData();
      formDataToSend.append("taskData", JSON.stringify(payload));
      if (taskImage) formDataToSend.append("image", taskImage);

      console.log("📤 SENDING TO BACKEND:", payload);

      const response = await edit_task(selectedTask.id , formDataToSend);
      if (response){
        console.log(response);
        toast.success("Task updated successfully!");
      }
      setIsEditOpen(false);
      setShowUserSelect(false);
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update task");
    }
  };

  // Handle delete
  const handleTaskDelete = async () => {
    try {
      if (!selectedTask) return;
      await delete_task(selectedTask.id );
      toast.success("Task deleted successfully!");
      setIsViewOpen(false);
      setIsDeleting(false);
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to delete task");
    }
  };

  // Status & Priority updates
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await update_task_status(taskId, newStatus);
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    try {
      await update_task_priority(taskId, newPriority);
      toast.success(`Priority updated to ${newPriority}`);
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update priority");
    }
  };

  // Open edit modal with prefilled data
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    const canEditAssign = task.createdBy === currentUser.id;
    setShowUserSelect(context === "user" && canEditAssign);
    setIsEditOpen(true);
  };

  // Filter tasks
  const today = new Date();
  const upcomingTasks = allTasks.filter(
    (task) => new Date(task.startDate) > today && ["pending", "in-progress"].includes(task.status)
  );
  const pendingTasks = allTasks.filter((task) => {
    const start = new Date(task.startDate);
    const due = new Date(task.dueDate);
    return start <= today && today <= due && task.status === "pending";
  });
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress");
  const completedTasks = allTasks.filter((t) => t.status === "completed");
  const notCompletedTasks = allTasks.filter((t) => t.status === "not-completed");

  // Initial data for edit
  const getEditInitialData = (): Partial<TaskFormValues & { taskImagePreview?: string }> => {
    if (!selectedTask) return {};

    const canEditAssign = selectedTask.createdBy === currentUser.id;

    return {
      name: selectedTask.name || "",
      description: selectedTask.description || "",
      priority: selectedTask.priority || "medium",
      startDate: formatDate(selectedTask.startDate),
      dueDate: formatDate(selectedTask.dueDate),
      notificationDate: formatDate(selectedTask.notificationDate),
      notificationTime: selectedTask.notificationTime || "",
      status: selectedTask.status || "pending",
      assignedUsers: canEditAssign
        ? (selectedTask.assignedUsersDetails || [])
            .map((u: User) => u.id)
            .filter(Boolean) as string[]
        : [],
      taskImagePreview: selectedTask.image || "",
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          color="primary"
          size="sm"
          startContent={<FaPlus />}
          onPress={() => {
            setShowUserSelect(false);
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
            onViewTask={(t) => {
              setSelectedTask(t);
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
            onViewTask={(t) => {
              setSelectedTask(t);
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
            onViewTask={(t) => {
              setSelectedTask(t);
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
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            formatDate={formatDate}
          />
        </Tab>
      </Tabs>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalBody>
            <TaskForm
              users={connectedUsers}
              context={context}
              isEditMode={false}
              showUserSelect={showUserSelect}
              setShowUserSelect={setShowUserSelect}
              onSubmit={handleTaskCreate}
              onCancel={() => setIsOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalBody>
            <TaskForm
              initialData={getEditInitialData()}
              users={connectedUsers}
              context={context}
              isEditMode={true}
              showUserSelect={showUserSelect}
              setShowUserSelect={setShowUserSelect}
              canEditAssignment={selectedTask?.createdBy === currentUser.id}
              onSubmit={handleTaskUpdate}
              onCancel={() => setIsEditOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <TaskViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={selectedTask}
        onEdit={() => {
          setIsViewOpen(false);
          openEditModal(selectedTask!);
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