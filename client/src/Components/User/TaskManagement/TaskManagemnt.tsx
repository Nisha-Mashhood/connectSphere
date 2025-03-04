import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Card,
  CardBody,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { RiTimeLine } from "react-icons/ri";
import { BsPersonCheck } from "react-icons/bs";
import { MdAssignment } from "react-icons/md";
import {
  FaPlus,
  FaCalendar,
  FaListUl,
  FaBell,
  FaImage,
  FaEllipsisV,
  FaEdit,
  FaTimes,
  FaTrash,
  FaHourglassHalf,
  FaArrowUp,
} from "react-icons/fa";
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
  startDate?: string;
  dueDate?: string;
  notificationDate?: string;
  notificationTime?: string;
}

const TaskManagement = ({ context, currentUser, contextData }) => {
  const { collabDetails, groupMemberships } = useSelector(
    (state: RootState) => state.profile
  );

  const collaborations = collabDetails?.data || [];
  const groups = groupMemberships || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [tasks, setTasks] = useState<any[]>([]);
  const [assignedByOthers, setAssignedByOthers] = useState<any[]>([]);
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [showCollabSelect, setShowCollabSelect] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add validation errors state
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setTaskData({
        ...taskData,
        taskImage: file,
        taskImagePreview: imageUrl,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Validation function for task dates
  const validateDates = () => {
    const newErrors: ITaskErrors = {};

    if (!taskData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (!taskData.description.trim()) {
      newErrors.description = "task description is required";
    }

    if (!taskData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!taskData.notificationTime) {
      newErrors.startDate = "Notification Time is required";
    }

    if (!taskData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (taskData.startDate && taskData.dueDate) {
      const startDate = new Date(taskData.startDate);
      const dueDate = new Date(taskData.dueDate);

      if (startDate >= dueDate) {
        newErrors.dueDate = "Due date must be after start date";
      }
    }

    if (taskData.notificationDate) {
      const notificationDate = new Date(taskData.notificationDate);
      const startDate = new Date(taskData.startDate);
      const dueDate = new Date(taskData.dueDate);

      if (notificationDate < startDate) {
        newErrors.notificationDate =
          "Notification date cannot be before start date";
      }

      if (notificationDate > dueDate) {
        newErrors.notificationDate =
          "Notification date cannot be after due date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTasks = async () => {
    try {
      const response = await get_tasks_by_context(context, contextData?._id);
      if (response) {
        const myTasks = response.filter(
          (task) => task.createdBy._id === currentUser._id
        );
        const assignedByOthers = response.filter(
          (task) => task.createdBy._id !== currentUser._id
        );

        console.log("My Tasks:", myTasks);
        console.log("Assigned by Others:", assignedByOthers);

        setTasks(myTasks);
        setAssignedByOthers(assignedByOthers);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [context, currentUser, contextData]);

  const generateTimeOptions = () => {
    const options = [];

    for (let hour = 0; hour < 24; hour++) {
      // Format as 12-hour time with AM/PM
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      // Format with leading zeros for hours less than 10
      const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;

      // Add the hour and half-hour options
      options.push(`${formattedHour}:00 ${period}`);
      options.push(`${formattedHour}:30 ${period}`);
    }

    return options;
  };

  const handleTaskCreate = async () => {
    if (!validateDates()) {
      return;
    }
    try {
      const formData = new FormData();

      // Remove taskImage and taskImagePreview before sending
      const { taskImage, taskImagePreview, ...filteredTaskData } = taskData;

      // Automatically set task status based on dates
      let autoStatus = filteredTaskData.status;
      const today = new Date();
      const startDate = new Date(filteredTaskData.startDate);
      const dueDate = new Date(filteredTaskData.dueDate);

      if (startDate > today) {
        // If start date is in the future, it's an upcoming task
        autoStatus = "pending";
      } else if (startDate <= today && today <= dueDate) {
        // If we're between start and due dates, it's in progress
        autoStatus = "in-progress";
      } else if (today > dueDate) {
        // If due date has passed, mark as not completed (will be changed to completed manually)
        autoStatus = "not-completed";
      }

      const newTask = {
        ...filteredTaskData,
        status: autoStatus,
        createdBy: currentUser._id,
        createdAt: new Date(),
        contextId: context === "profile" ? currentUser._id : contextData?._id,
        contextType: context,
        assignedGroups: showGroupSelect
          ? Array.from(taskData.assignedGroups)
          : [],
        assignedCollaborations: showCollabSelect
          ? Array.from(taskData.assignedCollaborations)
          : [],
      };


      // Append task data as a JSON string
      formData.append("taskData", JSON.stringify(newTask));

      // Append image if available
      if (taskData.taskImage) {
        formData.append("image", taskData.taskImage);
      }

      const response = await create_task(currentUser._id, formData);
      console.log("Created Task : ",response);
      let newTaskData = response.task;

      if (response) {
        toast.success("Task created successfully!");
        setIsOpen(false);
        resetForm();
        fetchTasks();
        
      const subscriptionResult = await handleSubscribe(newTaskData);
      if (subscriptionResult?.success) {
        toast.success("subscriptionResult ok");
      } else {
        toast.error("subscriptionResult not ok");
      }
      }
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    }
  };


  //TODO: handle subscription
  const convertTo24HourFormat = (timeStr: string) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
    if (!match) return null;
  
    let [_, hours, minutes, period] = match;
    let hoursInt = parseInt(hours, 10);
  
    if (period?.toUpperCase() === "PM" && hoursInt !== 12) {
      hoursInt += 12; // Convert PM hours (except 12 PM)
    } else if (period?.toUpperCase() === "AM" && hoursInt === 12) {
      hoursInt = 0; // Convert 12 AM to 00
    }
  
    return `${hoursInt.toString().padStart(2, "0")}:${minutes}`;
  };
  
  const handleSubscribe = async (taskData) => {
    try {
      // Register a service worker
      await registerSW();
  
      if (!taskData?.notificationDate || !taskData?.notificationTime) {
        console.error("Notification date and time are required.");
        return;
      }
  
      // Validate notificationDate
      if (isNaN(Date.parse(taskData.notificationDate))) {
        console.error("Invalid notification date:", taskData.notificationDate);
        return;
      }
  
      // Convert to 24-hour format
      const notificationTime24 = convertTo24HourFormat(taskData.notificationTime);
      if (!notificationTime24) {
        console.error("Invalid notification time format:", taskData.notificationTime);
        return;
      }
  
      // Check if notificationDate is already in ISO format
      const isIsoDate = taskData.notificationDate.includes('T');
  
      // Construct Date-Time String properly
      let dateTimeString;
      if (isIsoDate) {
        // If it's already ISO format, extract just the date part
        const datePart = taskData.notificationDate.split('T')[0];
        dateTimeString = `${datePart}T${notificationTime24}:00`;
      } else {
        // Use as is if it's just a date
        dateTimeString = `${taskData.notificationDate}T${notificationTime24}:00`;
      }
  
      console.log("Date-Time String before conversion:", dateTimeString);
      
      // Convert to Date object
      const notificationDateTime = new Date(dateTimeString);
  
      console.log("AFTER CONVERTING TO DATE OBJECT:", notificationDateTime);
      
      if (isNaN(notificationDateTime.getTime())) {
        console.error("Invalid Date-Time Value:", notificationDateTime);
        return;
      }
  
      const isoString = notificationDateTime.toISOString();
      console.log("Final Notification Date-Time (ISO):", isoString);
  
      const notifPermission = await Notification.requestPermission();
      if(notifPermission === 'default' || notifPermission === 'denied'){
        toast.error("please allow notification permission");
        return;
      }
      
      // Subscribe to the registered service worker
      const subscription = await subcribeTOSW();
  
      // Send task data also to store in task modal
      if (subscription) {
        await sendSubscriptionToServer(subscription, { notificationDateTime: isoString }, taskData);
        console.log("Subscription & notification time sent!");
        return { success: true, message: `Your notification is set for ${taskData.notificationDate} at ${taskData.notificationTime}.` };
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      return { success: false, message: "Failed to set notification." };
    }
  };

  const handleTaskUpdate = async () => {
    if (!validateDates()) {
      return;
    }

    try {
      if (!selectedTask) return;

      const { taskImage, taskImagePreview, ...updates } = taskData;

      // Automatically set task status based on dates if not manually set
      let autoStatus = updates.status;
      if (autoStatus !== selectedTask.status) {
        // Status was manually changed, keep the user's selection
      } else {
        // Status not changed, recalculate based on dates
        const today = new Date();
        const startDate = new Date(updates.startDate);
        const dueDate = new Date(updates.dueDate);

        if (startDate > today) {
          // If start date is in the future, it's an upcoming task
          autoStatus = "pending";
        } else if (startDate <= today && today <= dueDate) {
          // If we're between start and due dates, it's in progress
          autoStatus = "in-progress";
        } else if (today > dueDate && autoStatus !== "completed") {
          // If due date has passed and task is not marked as completed, mark as not completed
          autoStatus = "not-completed";
        }
      }

      // Convert sets to arrays for API
      const updatedTask = {
        ...updates,
        status: autoStatus,
        assignedGroups: showGroupSelect
          ? Array.from(taskData.assignedGroups)
          : [],
        assignedCollaborations: showCollabSelect
          ? Array.from(taskData.assignedCollaborations)
          : [],
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
      }

      // Refresh tasks
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
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

  const handlePriorityChange = async (taskId, newPriority) => {
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

  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    // Reset errors when opening edit modal
    setErrors({});

    // Format dates for the input fields
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    setTaskData({
      name: task.name || "",
      description: task.description || "",
      priority: task.priority || "medium",
      startDate: formatDate(task.startDate),
      dueDate: formatDate(task.dueDate),
      notificationDate: formatDate(task.notificationDate),
      notificationTime: task.notificationTime,
      privacy: task.privacy || "private",
      status: task.status || "pending",
      assignedGroups: new Set(task.assignedGroups || []),
      assignedCollaborations: new Set(task.assignedCollaborations || []),
      taskImage: null,
      taskImagePreview: task.image || "",
    });

    setShowGroupSelect(task.assignedGroups && task.assignedGroups.length > 0);
    setShowCollabSelect(
      task.assignedCollaborations && task.assignedCollaborations.length > 0
    );

    setIsEditOpen(true);
  };

  const renderCollaborationName = (collab: any) => {
    if (currentUser.role === "mentor") {
      // For mentors, show student (user) name
      return collab.userId?.name || "Unnamed Student";
    } else {
      // For users/students, show mentor name
      return collab.mentorId?.userId?.name || "Unnamed Mentor";
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const renderSelectedItems = (
    items: Set<string>,
    itemType: "group" | "collab"
  ) => {
    const itemList = itemType === "group" ? groups : collaborations;
    return Array.from(items).map((id) => {
      const item = itemList.find((i) => i._id === id);
      return (
        <Chip key={id} className="m-1" color="primary" size="sm">
          {itemType === "group" ? item?.name : renderCollaborationName(item)}
        </Chip>
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "in-progress":
        return "primary";
      case "not-completed":
        return "danger";
      default:
        return "default";
    }
  };

  const renderTaskCard = (task: any) => (
    <Card
      isPressable
      isHoverable
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => openViewModal(task)}
    >
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {task.image ? (
              <img
                src={task.image}
                alt="Task"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <FaListUl className="text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{task.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                {task.description}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Chip color={getPriorityColor(task.priority)} size="sm">
                  {task.priority} Priority
                </Chip>
                <Chip color={getStatusColor(task.status)} size="sm">
                  {task.status}
                </Chip>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-500 mb-2">
              Due: {formatDate(task.dueDate)}
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <FaEllipsisV />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Task Actions"
                onAction={(key) => {
                  const keyString = String(key);
                  if (key === "edit") {
                    openEditModal(task);
                  } else if (keyString.startsWith("status-")) {
                    const newStatus = keyString.replace("status-", "");
                    handleStatusChange(task._id, newStatus);
                  } else if (keyString.startsWith("priority-")) {
                    const newPriority = keyString.replace("priority-", "");
                    handlePriorityChange(task._id, newPriority);
                  }
                }}
              >
                <DropdownItem key="edit" startContent={<FaEdit />}>
                  Edit Task
                </DropdownItem>
                <DropdownItem
                  key="status-pending"
                  startContent={<RiTimeLine />}
                >
                  Mark as Pending
                </DropdownItem>
                <DropdownItem
                  key="status-in-progress"
                  startContent={<RiTimeLine />}
                >
                  Mark as In-Progress
                </DropdownItem>
                <DropdownItem
                  key="status-completed"
                  startContent={<RiTimeLine />}
                >
                  Mark as Completed
                </DropdownItem>
                <DropdownItem
                  key="status-not-completed"
                  startContent={<RiTimeLine />}
                >
                  Mark as Not-Completed
                </DropdownItem>
                <DropdownItem key="priority-low" startContent={<FaListUl />}>
                  Low Priority
                </DropdownItem>
                <DropdownItem key="priority-medium" startContent={<FaListUl />}>
                  Medium Priority
                </DropdownItem>
                <DropdownItem key="priority-high" startContent={<FaListUl />}>
                  High Priority
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Function to filter upcoming tasks - start date is in the future
  const getUpcomingTasks = () => {
    return tasks.filter((task) => {
      const startDate = new Date(task.startDate);
      const today = new Date();
      return (
        startDate > today &&
        (task.status === "pending" || task.status === "in-progress")
      );
    });
  };

  // Function to filter pending tasks - start date has passed but not completed
  const getPendingTasks = () => {
    return tasks.filter((task) => {
      const startDate = new Date(task.startDate);
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return (
        startDate <= today &&
        today <= dueDate &&
        (task.status === "pending" || task.status === "in-progress")
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          Add New Task
        </Button>
      </div>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key.toString())}
      >
        <Tab
          key="my-tasks"
          title={
            <div className="flex items-center gap-2">
              <MdAssignment />
              <span>My Tasks</span>
            </div>
          }
        >
          <Tabs aria-label="My Tasks" className="mt-2" variant="light">
            <Tab
              key="my-upcoming"
              title={
                <div className="flex items-center gap-2">
                  <FaArrowUp />
                  <span>Upcoming</span>
                </div>
              }
            >
              <div className="mt-4">
                {getUpcomingTasks().map((task, index) => (
                  <div key={task._id || index}>{renderTaskCard(task)}</div>
                ))}
                {getUpcomingTasks().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="my-pending"
              title={
                <div className="flex items-center gap-2">
                  <FaHourglassHalf />
                  <span>Pending</span>
                </div>
              }
            >
              <div className="mt-4">
                {getPendingTasks().map((task, index) => (
                  <div key={task._id || index}>{renderTaskCard(task)}</div>
                ))}
                {getPendingTasks().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="my-completed"
              title={
                <div className="flex items-center gap-2">
                  <FaListUl />
                  <span>Completed</span>
                </div>
              }
            >
              <div className="mt-4">
                {tasks
                  .filter((task) => task.status === "completed")
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {tasks.filter((task) => task.status === "completed").length ===
                  0 && (
                  <div className="text-center py-8 text-gray-500">
                    No completed tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="my-not-completed"
              title={
                <div className="flex items-center gap-2">
                  <FaTimes />
                  <span>Not Completed</span>
                </div>
              }
            >
              <div className="mt-4">
                {tasks
                  .filter((task) => task.status === "not-completed")
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {tasks.filter((task) => task.status === "not-completed")
                  .length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No not-completed tasks found
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Tab>

        {/* Assigned By Others Section */}
        <Tab
          key="assigned-tasks"
          title={
            <div className="flex items-center gap-2">
              <BsPersonCheck />
              <span>Assigned By Others</span>
              {assignedByOthers.length > 0 && (
                <Chip size="sm" color="secondary">
                  {assignedByOthers.length}
                </Chip>
              )}
            </div>
          }
        >
          <Tabs aria-label="Assigned Tasks" className="mt-2" variant="light">
            <Tab
              key="assigned-upcoming"
              title={
                <div className="flex items-center gap-2">
                  <FaArrowUp />
                  <span>Upcoming</span>
                </div>
              }
            >
              <div className="mt-4">
                {assignedByOthers
                  .filter((task) => {
                    const startDate = new Date(task.startDate);
                    const today = new Date();
                    return startDate > today && task.status !== "completed";
                  })
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {assignedByOthers.filter((task) => {
                  const startDate = new Date(task.startDate);
                  const today = new Date();
                  return startDate > today && task.status !== "completed";
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming assigned tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="assigned-pending"
              title={
                <div className="flex items-center gap-2">
                  <FaHourglassHalf />
                  <span>Pending</span>
                </div>
              }
            >
              <div className="mt-4">
                {assignedByOthers
                  .filter((task) => {
                    const startDate = new Date(task.startDate);
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    return (
                      startDate <= today &&
                      today <= dueDate &&
                      task.status !== "completed"
                    );
                  })
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {assignedByOthers.filter((task) => {
                  const startDate = new Date(task.startDate);
                  const dueDate = new Date(task.dueDate);
                  const today = new Date();
                  return (
                    startDate <= today &&
                    today <= dueDate &&
                    task.status !== "completed"
                  );
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending assigned tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="assigned-completed"
              title={
                <div className="flex items-center gap-2">
                  <FaListUl />
                  <span>Completed</span>
                </div>
              }
            >
              <div className="mt-4">
                {assignedByOthers
                  .filter((task) => task.status === "completed")
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {assignedByOthers.filter((task) => task.status === "completed")
                  .length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No completed assigned tasks found
                  </div>
                )}
              </div>
            </Tab>
            <Tab
              key="assigned-not-completed"
              title={
                <div className="flex items-center gap-2">
                  <FaTimes />
                  <span>Not Completed</span>
                </div>
              }
            >
              <div className="mt-4">
                {assignedByOthers
                  .filter((task) => task.status === "not-completed")
                  .map((task, index) => (
                    <div key={task._id || index}>{renderTaskCard(task)}</div>
                  ))}
                {assignedByOthers.filter(
                  (task) => task.status === "not-completed"
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No not-completed assigned tasks found
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Tab>
      </Tabs>

          {/* create new task modal  */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    label="Task Name"
                    placeholder="Enter task name"
                    value={taskData.name}
                    onChange={(e) =>
                      setTaskData({ ...taskData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <span className="text-xs text-danger">{errors.name}</span>
                  )}
                </div>
                <div className="w-32">
                  <input
                    type="file"
                    accept="image/*"
                    id="task-image"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="task-image"
                    className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-50"
                  >
                    {taskData.taskImagePreview ? (
                      <img
                        src={taskData.taskImagePreview}
                        alt="Task Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <FaImage className="text-2xl text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Add Image
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Textarea
                label="Description"
                placeholder="Enter task description"
                value={taskData.description}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
              />
              {errors.description && (
                <span className="text-xs text-danger">
                  {errors.description}
                </span>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    placeholder="Select start date"
                    value={taskData.startDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, startDate: e.target.value })
                    }
                    startContent={<FaCalendar className="text-default-400" />}
                  />
                  {errors.startDate && (
                    <span className="text-xs text-danger">
                      {errors.startDate}
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    type="date"
                    label="Due Date"
                    placeholder="Select due date"
                    value={taskData.dueDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, dueDate: e.target.value })
                    }
                    startContent={<FaCalendar className="text-default-400" />}
                  />
                  {errors.dueDate && (
                    <span className="text-xs text-danger">
                      {errors.dueDate}
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    type="date"
                    label="Notification Date"
                    placeholder="Select Notification date"
                    value={taskData.notificationDate}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        notificationDate: e.target.value,
                      })
                    }
                    startContent={<FaBell className="text-default-400" />}
                  />
                  {errors.notificationDate && (
                    <span className="text-xs text-danger">
                      {errors.notificationDate}
                    </span>
                  )}
                </div>

                <div>
                  <Select
                    label="Notification Time"
                    placeholder="Select notification time"
                    value={taskData.notificationTime}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        notificationTime: e.target.value,
                      })
                    }
                    startContent={<FaBell className="text-default-400" />}
                  >
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.notificationTime && (
                    <span className="text-xs text-danger">
                      {errors.notificationTime}
                    </span>
                  )}
                </div>
              </div>

              <Select
                label="Priority"
                selectedKeys={[taskData.priority]}
                value={taskData.priority}
                onChange={(e) => {
                  const value = e.target.value as "low" | "medium" | "high";
                  setTaskData({ ...taskData, priority: value });
                }}
              >
                <SelectItem key="low" value="low">
                  <Chip color="success" size="sm">
                    Low Priority
                  </Chip>
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  <Chip color="warning" size="sm">
                    Medium Priority
                  </Chip>
                </SelectItem>
                <SelectItem key="high" value="high">
                  <Chip color="danger" size="sm">
                    High Priority
                  </Chip>
                </SelectItem>
              </Select>
              <div className="mt-2">
                <Chip color={getPriorityColor(taskData.priority)} size="sm">
                  Selected Priority: {taskData.priority}
                </Chip>
              </div>

              {context === "profile" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGroupSelect}
                        onChange={(e) => setShowGroupSelect(e.target.checked)}
                        className="rounded"
                      />
                      Assign to Groups
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCollabSelect}
                        onChange={(e) => setShowCollabSelect(e.target.checked)}
                        className="rounded"
                      />
                      Assign to Collaborations
                    </label>
                  </div>

                  {showGroupSelect && groups.length > 0 && (
                    <>
                      <Select
                        label="Select Groups"
                        selectionMode="multiple"
                        placeholder="Choose groups to assign"
                        selectedKeys={taskData.assignedGroups}
                        onChange={(e) => {
                          setTaskData({
                            ...taskData,
                            assignedGroups: new Set(e.target.value.split(",")),
                          });
                        }}
                      >
                        {groups.map((group) => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {renderSelectedItems(taskData.assignedGroups, "group")}
                      </div>
                    </>
                  )}

                  {showCollabSelect && collaborations.length > 0 && (
                    <>
                      <Select
                        label="Select Collaborations"
                        selectionMode="multiple"
                        placeholder="Choose collaborations to assign"
                        selectedKeys={taskData.assignedCollaborations}
                        onChange={(e) => {
                          setTaskData({
                            ...taskData,
                            assignedCollaborations: new Set(
                              e.target.value.split(",")
                            ),
                          });
                        }}
                      >
                        {collaborations.map((collab) => (
                          <SelectItem key={collab._id} value={collab._id}>
                            {renderCollaborationName(collab)}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {renderSelectedItems(
                          taskData.assignedCollaborations,
                          "collab"
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleTaskCreate}>
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    label="Task Name"
                    placeholder="Enter task name"
                    value={taskData.name}
                    onChange={(e) =>
                      setTaskData({ ...taskData, name: e.target.value })
                    }
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                  />
                </div>
                <div className="w-32">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-task-image"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="edit-task-image"
                    className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-50"
                  >
                    {taskData.taskImagePreview ? (
                      <img
                        src={taskData.taskImagePreview}
                        alt="Task Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <FaImage className="text-2xl text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Add Image
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Textarea
                label="Description"
                placeholder="Enter task description"
                value={taskData.description}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
                isInvalid={!!errors.description}
                errorMessage={errors.description}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    placeholder="Select start date"
                    value={taskData.startDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, startDate: e.target.value })
                    }
                    startContent={<FaCalendar className="text-default-400" />}
                  />
                  {errors.startDate && (
                    <span className="text-xs text-danger">
                      {errors.startDate}
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    type="date"
                    label="Due Date"
                    placeholder="Select due date"
                    value={taskData.dueDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, dueDate: e.target.value })
                    }
                    startContent={<FaCalendar className="text-default-400" />}
                  />
                  {errors.dueDate && (
                    <span className="text-xs text-danger">
                      {errors.dueDate}
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    type="date"
                    label="Notification Date"
                    placeholder="Select Notification date"
                    value={taskData.notificationDate}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        notificationDate: e.target.value,
                      })
                    }
                    startContent={<FaBell className="text-default-400" />}
                  />
                  {errors.notificationDate && (
                    <span className="text-xs text-danger">
                      {errors.notificationDate}
                    </span>
                  )}
                </div>

                <div>
                  <Select
                    label="Notification Time"
                    placeholder="Select notification time"
                    value={taskData.notificationTime}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        notificationTime: e.target.value,
                      })
                    }
                    startContent={<FaBell className="text-default-400" />}
                  >
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.notificationTime && (
                    <span className="text-xs text-danger">
                      {errors.notificationTime}
                    </span>
                  )}
                </div>

                <Select
                  label="Status"
                  selectedKeys={[taskData.status]}
                  onChange={(e) => {
                    const value = e.target.value as
                      | "pending"
                      | "in-progress"
                      | "completed"
                      | "not-completed";
                    setTaskData({ ...taskData, status: value });
                  }}
                >
                  <SelectItem key="pending" value="pending">
                    <Chip color="warning" size="sm">
                      Pending
                    </Chip>
                  </SelectItem>
                  <SelectItem key="in-progress" value="in-progress">
                    <Chip color="primary" size="sm">
                      In Progress
                    </Chip>
                  </SelectItem>
                  <SelectItem key="completed" value="completed">
                    <Chip color="success" size="sm">
                      Completed
                    </Chip>
                  </SelectItem>
                  <SelectItem key="not-completed" value="not-completed">
                    <Chip color="danger" size="sm">
                      Not Completed
                    </Chip>
                  </SelectItem>
                </Select>
              </div>

              <Select
                label="Priority"
                selectedKeys={[taskData.priority]}
                onChange={(e) => {
                  const value = e.target.value as "low" | "medium" | "high";
                  setTaskData({ ...taskData, priority: value });
                }}
              >
                <SelectItem key="low" value="low">
                  <Chip color="success" size="sm">
                    Low Priority
                  </Chip>
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  <Chip color="warning" size="sm">
                    Medium Priority
                  </Chip>
                </SelectItem>
                <SelectItem key="high" value="high">
                  <Chip color="danger" size="sm">
                    High Priority
                  </Chip>
                </SelectItem>
              </Select>
              <div className="mt-2">
                <Chip color={getPriorityColor(taskData.priority)} size="sm">
                  Selected Priority: {taskData.priority}
                </Chip>
              </div>

              {context === "profile" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGroupSelect}
                        onChange={(e) => setShowGroupSelect(e.target.checked)}
                        className="rounded"
                      />
                      Assign to Groups
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCollabSelect}
                        onChange={(e) => setShowCollabSelect(e.target.checked)}
                        className="rounded"
                      />
                      Assign to Collaborations
                    </label>
                  </div>

                  {showGroupSelect && groups.length > 0 && (
                    <>
                      <Select
                        label="Select Groups"
                        selectionMode="multiple"
                        placeholder="Choose groups to assign"
                        selectedKeys={taskData.assignedGroups}
                        onChange={(e) => {
                          setTaskData({
                            ...taskData,
                            assignedGroups: new Set(e.target.value.split(",")),
                          });
                        }}
                      >
                        {groups.map((group) => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {renderSelectedItems(taskData.assignedGroups, "group")}
                      </div>
                    </>
                  )}

                  {showCollabSelect && collaborations.length > 0 && (
                    <>
                      <Select
                        label="Select Collaborations"
                        selectionMode="multiple"
                        placeholder="Choose collaborations to assign"
                        selectedKeys={taskData.assignedCollaborations}
                        onChange={(e) => {
                          setTaskData({
                            ...taskData,
                            assignedCollaborations: new Set(
                              e.target.value.split(",")
                            ),
                          });
                        }}
                      >
                        {collaborations.map((collab) => (
                          <SelectItem key={collab._id} value={collab._id}>
                            {renderCollaborationName(collab)}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {renderSelectedItems(
                          taskData.assignedCollaborations,
                          "collab"
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleTaskUpdate}>
              Update Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Task Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        size="2xl"
      >
        <ModalContent>
          {selectedTask && (
            <>
              <ModalHeader className="flex justify-between items-center">
                <div>{selectedTask.name}</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    startContent={<FaEdit />}
                    onPress={() => {
                      setIsViewOpen(false);
                      openEditModal(selectedTask);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={<FaTrash />}
                    onPress={() => setIsDeleting(true)}
                  >
                    Delete
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody>
                {isDeleting ? (
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Are you sure you want to delete this task?
                    </h3>
                    <div className="flex justify-center gap-4">
                      <Button
                        color="default"
                        variant="flat"
                        onPress={() => setIsDeleting(false)}
                      >
                        Cancel
                      </Button>
                      <Button color="danger" onPress={handleTaskDelete}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTask.image && (
                      <img
                        src={selectedTask.image}
                        alt="Task"
                        className="w-full max-h-60 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Chip
                        color={getPriorityColor(selectedTask.priority)}
                        size="sm"
                      >
                        {selectedTask.priority} Priority
                      </Chip>
                      <Chip
                        color={getStatusColor(selectedTask.status)}
                        size="sm"
                      >
                        {selectedTask.status}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>
                          Start Date: {formatDate(selectedTask.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>
                          Due Date: {formatDate(selectedTask.dueDate)}
                        </span>
                      </div>

                      {selectedTask.notificationDate && (
                        <div className="flex items-center gap-2">
                          <FaBell />
                          <span>
                            Notification:{" "}
                            {formatDate(selectedTask.notificationDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600 whitespace-pre-line">
                        {selectedTask.description || "No description provided."}
                      </p>
                    </div>

                    {selectedTask.assignedGroups?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Assigned Groups</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedTask.assignedGroups.map((groupId) => {
                            const group = groups.find((g) => g._id === groupId);
                            return (
                              <Chip key={groupId} color="primary" size="sm">
                                {group?.name || "Unknown Group"}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedTask.assignedCollaborations?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Assigned Collaborations
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedTask.assignedCollaborations.map(
                            (collabId) => {
                              const collab = collaborations.find(
                                (c) => c._id === collabId
                              );
                              return (
                                <Chip key={collabId} color="primary" size="sm">
                                  {collab
                                    ? renderCollaborationName(collab)
                                    : "Unknown Collaboration"}
                                </Chip>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TaskManagement;
