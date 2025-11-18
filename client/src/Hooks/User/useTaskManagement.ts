import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  create_task,
  delete_task,
  edit_task,
  get_tasks_by_context,
  update_task_priority,
  update_task_status,
} from "../../Service/Task.Service";
import { getUser_UserConnections } from "../../Service/User-User.Service";
import { TaskFormValues } from "../../validation/taskValidation";
import { Task } from "../../Interface/User/Itask";
import { User, Group, CollabData } from "../../redux/types";

export function useTaskManagement(
  context: "user" | "group" | "collaboration",
  currentUser: User,
  contextData?: User | Group | CollabData
) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // MODAL STATES
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // USER SELECT
  const [connectedUsers, setConnectedUsers] = useState<
    { userId: string; name: string }[]
  >([]);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const [selectedTab, setSelectedTab] = useState("upcoming");

  // FETCH USER CONNECTIONS
  const fetchUserConnections = useCallback(async () => {
    if (context !== "user") return;

    try {
      const data = await getUser_UserConnections(currentUser.id);

      const filtered = data
        .filter(
          (c) =>
            c.requestStatus === "Accepted" &&
            c.connectionStatus === "Connected"
        )
        .map((c) => {
          const other =
            c.requester.id === currentUser.id ? c.recipient : c.requester;

          return {
            userId: other.id,
            name: other.name || "Unnamed User",
          };
        });

      setConnectedUsers(filtered);
    } catch (err) {
        console.log(err)
      toast.error("Failed to fetch connections");
    }
  }, [context, currentUser.id]);

  // FETCH TASKS
  const fetchTasks = useCallback(async () => {
    try {
      const response = await get_tasks_by_context(
        context,
        contextData?.id,
        currentUser.id
      );

      if (Array.isArray(response)) {
        setAllTasks(
          response.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    } catch (err) {
        console.log(err)
      toast.error("Failed to fetch tasks");
    }
  }, [context, contextData?.id, currentUser.id]);

  useEffect(() => {
    fetchTasks();
    fetchUserConnections();
  }, [fetchTasks, fetchUserConnections]);

  // HELPERS
  const formatDate = (date: string) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  const calculateStatus = (
    start: string,
    due: string,
    currentStatus?: string
  ) => {
    const today = new Date();
    const s = new Date(start);
    const d = new Date(due);

    if (currentStatus === "completed") return "completed";
    if (s > today) return "pending";
    if (today <= d) return "in-progress";
    return "not-completed";
  };

  // CREATE TASK
  const createTask = async (data: TaskFormValues, allowAssign: boolean) => {
    try {
      const { taskImage, ...rest } = data;
      const status = calculateStatus(rest.startDate, rest.dueDate);

      const payload = {
        ...rest,
        status,
        createdBy: currentUser.id,
        contextId: context === "user" ? currentUser.id : contextData?.id,
        contextType: context,
        assignedUsers:
          context === "user" && allowAssign ? rest.assignedUsers || [] : [],
      };

      const fd = new FormData();
      fd.append("taskData", JSON.stringify(payload));
      if (taskImage) fd.append("image", taskImage);

      await create_task(currentUser.id, fd);
      toast.success("Task created");

      setIsOpen(false);
      setShowUserSelect(false);
      fetchTasks();
    } catch (err) {
        console.log(err)
      toast.error(err.message || "Error creating task");
    }
  };

  // UPDATE TASK
  const updateTask = async (data: TaskFormValues, allowAssign: boolean) => {
    if (!selectedTask) return;

    try {
      const { taskImage, ...rest } = data;
      const status = calculateStatus(
        rest.startDate,
        rest.dueDate,
        rest.status
      );

      const payload = {
        ...rest,
        status,
        assignedUsers:
          context === "user" && allowAssign ? rest.assignedUsers || [] : [],
      };

      const fd = new FormData();
      fd.append("taskData", JSON.stringify(payload));
      if (taskImage) fd.append("image", taskImage);

      await edit_task(selectedTask.id, fd);
      toast.success("Task updated");

      setIsEditOpen(false);
      setShowUserSelect(false);
      fetchTasks();
    } catch (err) {
        console.log(err)
      toast.error(err.message || "Error updating task");
    }
  };

  // DELETE TASK
  const deleteTask = async () => {
    if (!selectedTask) return;

    try {
      await delete_task(selectedTask.id);
      toast.success("Task deleted");

      setIsViewOpen(false);
      setIsDeleting(false);
      fetchTasks();
    } catch (err) {
        console.log(err);
      toast.error(err.message || "Error deleting task");
    }
  };

  // STATUS UPDATE
  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      await update_task_status(taskId, newStatus);
      fetchTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // PRIORITY UPDATE
  const updatePriority = async (taskId: string, priority: string) => {
    try {
      await update_task_priority(taskId, priority);
      fetchTasks();
    } catch {
      toast.error("Failed to update priority");
    }
  };

  // FILTERS
  const today = new Date();
  const tasksByStatus = {
    upcoming: allTasks.filter(
      (t) =>
        new Date(t.startDate) > today &&
        ["pending", "in-progress"].includes(t.status)
    ),
    pending: allTasks.filter((t) => {
      const s = new Date(t.startDate);
      const d = new Date(t.dueDate);
      return s <= today && today <= d && t.status === "pending";
    }),
    inProgress: allTasks.filter((t) => t.status === "in-progress"),
    completed: allTasks.filter((t) => t.status === "completed"),
    notCompleted: allTasks.filter((t) => t.status === "not-completed"),
  };

  const getEditInitialData = () => {
    if (!selectedTask) return {};

    const editable = selectedTask.createdBy === currentUser.id;

    return {
      name: selectedTask.name,
      description: selectedTask.description,
      priority: selectedTask.priority,
      startDate: formatDate(selectedTask.startDate),
      dueDate: formatDate(selectedTask.dueDate),
      notificationDate: formatDate(selectedTask.notificationDate),
      notificationTime: selectedTask.notificationTime,
      status: selectedTask.status,
      assignedUsers: editable
        ? selectedTask.assignedUsersDetails?.map((u) => u.id) || []
        : [],
      taskImagePreview: selectedTask.image,
    };
  };

  return {
    selectedTask,
    setSelectedTask,

    // modal controls
    modals: {
      isOpen,
      setIsOpen,
      isEditOpen,
      setIsEditOpen,
      isViewOpen,
      setIsViewOpen,
      isDeleting,
      setIsDeleting,
    },

    tasksByStatus,
    selectedTab,
    setSelectedTab,

    connectedUsers,
    showUserSelect,
    setShowUserSelect,

    handlers: {
      createTask,
      updateTask,
      deleteTask,
      updateStatus,
      updatePriority,
    },

    formatDate,
    getEditInitialData,
  };
}