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
} from "react-icons/fa";
import toast from "react-hot-toast";
import { RootState } from "../../../redux/store";
import {
  create_task,
  edit_task,
  get_tasks_by_context,
  update_task_priority,
  update_task_status,
} from "../../../Service/Task.Service";
// Import your task creation service/API
// import { createTask } from "../../../../Service/Task.Service";

interface ITaskData {
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  dueDate: string;
  notificationDate: string;
  privacy: "private";
  status: "pending" | "in-progress" | "completed" | "not-completed";
  assignedGroups: Set<string>;
  assignedCollaborations: Set<string>;
  taskImage: File | null;
  taskImagePreview: string;
}

const TaskManagement = ({ context, currentUser, contextData }) => {
  // const dispatch = useDispatch();
  const { collabDetails, groupMemberships } = useSelector(
    (state: RootState) => state.profile
  );

  const collaborations = collabDetails?.data || [];
  const groups = groupMemberships || [];

  console.log("Collab Details : ", collaborations);

  console.log("groupMembership :", groups);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [tasks, setTasks] = useState<any[]>([]);
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [showCollabSelect, setShowCollabSelect] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [taskData, setTaskData] = useState<ITaskData>({
    name: "",
    description: "",
    priority: "medium",
    startDate: "",
    dueDate: "",
    notificationDate: "",
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

  const fetchTasks = async () => {
    try {
      const response = await get_tasks_by_context(context, contextData?._id);
      if (response) {
        setTasks(response);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [context, currentUser, contextData]);
  console.log("Context :", context);
  console.log("Context Data :",contextData);

  const handleTaskCreate = async () => {
    try {
      const formData = new FormData();

      // Remove taskImage and taskImagePreview before sending
      const { taskImage, taskImagePreview, ...filteredTaskData } = taskData;

      const newTask = {
        ...filteredTaskData,
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

      console.log("Sending Task Data:", newTask);

      const response = await create_task(currentUser._id, formData);

      if (response) {
        toast.success("Task created successfully!");
        setIsOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    }
  };

  const handleTaskUpdate = async () => {
    try {
      if (!selectedTask) return;

      const { taskImage, taskImagePreview, ...updates } = taskData;

      // Convert sets to arrays for API
      const updatedTask = {
        ...updates,
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

      // API call to delete task here
      // const response = await delete_task(selectedTask._id);

      toast.success("Task deleted successfully!");
      setIsViewOpen(false);
      setIsDeleting(false);

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
      priority: "low",
      startDate: "",
      dueDate: "",
      notificationDate: "",
      privacy: "private",
      status: "pending",
      assignedGroups: new Set([]),
      assignedCollaborations: new Set([]),
      taskImage: null,
      taskImagePreview: "",
    });
    setShowGroupSelect(false);
    setShowCollabSelect(false);
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
                <Button isIconOnly size="sm" variant="light"
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => setIsOpen(true)}
        >
          Add New Task
        </Button>
      </div>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key.toString())}
      >
        <Tab
          key="upcoming"
          title={
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>Upcoming Tasks</span>
            </div>
          }
        >
          <div className="mt-4">
            {tasks
              .filter(
                (task) =>
                  task.status === "pending" || task.status === "in-progress"
              )
              .map((task, index) => (
                <div key={task._id || index}>{renderTaskCard(task)}</div>
              ))}
            {tasks.filter(
              (task) =>
                task.status === "pending" || task.status === "in-progress"
            ).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No upcoming tasks found
              </div>
            )}
          </div>
        </Tab>
        <Tab
          key="completed"
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
          key="not-completed"
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
            {tasks.filter((task) => task.status === "not-completed").length ===
              0 && (
              <div className="text-center py-8 text-gray-500">
                No not-completed tasks found
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="flex flex-col">
                              <span>
                                Assign to collab with{" "}
                                {renderCollaborationName(collab)}
                              </span>
                            </div>
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
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleTaskCreate}>
              Create Task
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
        {selectedTask && (
          <ModalContent>
            <ModalHeader className="flex justify-between items-center">
              <span>Task Details</span>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="light"
                  onPress={() => {
                    setIsViewOpen(false);
                    openEditModal(selectedTask);
                  }}
                >
                  <FaEdit />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => setIsDeleting(true)}
                >
                  <FaTrash />
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {selectedTask.image && (
                  <div className="flex justify-center">
                    <img
                      src={selectedTask.image}
                      alt={selectedTask.name}
                      className="max-h-48 rounded-lg object-cover"
                    />
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold">{selectedTask.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Chip color={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority} Priority
                    </Chip>
                    <Chip color={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </Chip>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="mt-1 text-gray-700">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-500">Start Date</h4>
                    <p>{formatDate(selectedTask.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Due Date</h4>
                    <p>{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">
                      Notification Date
                    </h4>
                    <p>{formatDate(selectedTask.notificationDate)}</p>
                  </div>
                </div>

                {selectedTask.assignedGroups &&
                  selectedTask.assignedGroups.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-500">
                        Assigned Groups
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
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

                {selectedTask.assignedCollaborations &&
                  selectedTask.assignedCollaborations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-500">
                        Assigned Collaborations
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTask.assignedCollaborations.map((collabId) => {
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
                        })}
                      </div>
                    </div>
                  )}

                <div className="pt-2">
                  <h4 className="font-medium text-gray-500">Change Status</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      size="sm"
                      color="warning"
                      variant={
                        selectedTask.status === "pending" ? "solid" : "bordered"
                      }
                      onPress={() =>
                        handleStatusChange(selectedTask._id, "pending")
                      }
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant={
                        selectedTask.status === "in-progress"
                          ? "solid"
                          : "bordered"
                      }
                      onPress={() =>
                        handleStatusChange(selectedTask._id, "in-progress")
                      }
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      color="success"
                      variant={
                        selectedTask.status === "completed"
                          ? "solid"
                          : "bordered"
                      }
                      onPress={() =>
                        handleStatusChange(selectedTask._id, "completed")
                      }
                    >
                      Completed
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant={
                        selectedTask.status === "not-completed"
                          ? "solid"
                          : "bordered"
                      }
                      onPress={() =>
                        handleStatusChange(selectedTask._id, "not-completed")
                      }
                    >
                      Not Completed
                    </Button>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsViewOpen(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
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
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <Input
                  type="date"
                  label="Notification Date"
                  placeholder="Select notification date"
                  value={taskData.notificationDate}
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      notificationDate: e.target.value,
                    })
                  }
                  startContent={<FaBell className="text-default-400" />}
                />

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
              </div>

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
                            <div className="flex flex-col">
                              <span>
                                Assign to collab with{" "}
                                {renderCollaborationName(collab)}
                              </span>
                            </div>
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
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleTaskUpdate}>
              Update Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleting} onClose={() => setIsDeleting(false)} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setIsDeleting(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={handleTaskDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TaskManagement;
