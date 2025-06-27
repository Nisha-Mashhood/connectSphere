import React from "react";
import { Input, Textarea, Select, SelectItem, Chip, Button } from "@nextui-org/react";
import { FaCalendar, FaBell, FaImage } from "react-icons/fa";
import { Collaboration, Group } from "../../types";

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

interface TaskFormProps {
  taskData: ITaskData;
  errors: ITaskErrors;
  users: { userId: string; name: string }[];
  groups: Group[];
  collaborations: Collaboration[];
  showUserSelect: boolean;
  context: string;
  isEditMode: boolean;
  onInputChange: (field: keyof ITaskData, value: any) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowUserSelect: (value: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  taskData,
  errors,
  users,
  showUserSelect,
  context,
  isEditMode,
  onInputChange,
  onImageChange,
  setShowUserSelect,
  onSubmit,
  onCancel,
}) => {
  // const { currentUser } = useSelector((state: RootState) => state.user);

  console.log("User connections:", users);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        options.push(`${formattedHour}:${formattedMinute} ${period}`);
      }
    }
    return options;
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

  const renderSelectedItems = (items: Set<string>, itemType: "user") => {
    if (itemType !== "user") return null;
    return Array.from(items).map((id) => {
      const user = users.find((u) => u.userId === id);
      return user ? (
        <Chip key={id} className="m-1" color="primary" size="sm">
          {user.name}
        </Chip>
      ) : null;
    }).filter(Boolean);
  };

  return (
    <div className="space-y-4">
      {/* Header section with name and image */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <Input
            label="Task Name"
            placeholder="Enter task name"
            value={taskData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            size="sm"
            isInvalid={!!errors.name}
            errorMessage={errors.name}
          />
        </div>
        <div className="w-24">
          <input
            type="file"
            accept="image/*"
            id={`task-image-${isEditMode ? "edit" : "create"}`}
            className="hidden"
            onChange={onImageChange}
          />
          <label
            htmlFor={`task-image-${isEditMode ? "edit" : "create"}`}
            className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg hover:bg-gray-100"
          >
            {taskData.taskImagePreview ? (
              <img src={taskData.taskImagePreview} alt="Task Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <>
                <FaImage className="text-xl text-gray-500" />
                <span className="mt-1 text-sm text-gray-600">Add Image</span>
              </>
            )}
          </label>
          {errors.taskImage && <span className="text-red-500 text-xs">{errors.taskImage}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Input
            type="date"
            label="Start Date"
            placeholder="Select start date"
            value={taskData.startDate}
            onChange={(e) => onInputChange("startDate", e.target.value)}
            startContent={<FaCalendar className="text-default-400 text-sm" />}
            size="sm"
            isInvalid={!!errors.startDate}
            errorMessage={errors.startDate}
          />
          <Input
            type="date"
            label="Due Date"
            placeholder="Select due date"
            value={taskData.dueDate}
            onChange={(e) => onInputChange("dueDate", e.target.value)}
            startContent={<FaCalendar className="text-default-400 text-sm" />}
            size="sm"
            isInvalid={!!errors.dueDate}
            errorMessage={errors.dueDate}
          />
          <Input
            type="date"
            label="Notification Date"
            placeholder="Select notification date"
            value={taskData.notificationDate}
            onChange={(e) => onInputChange("notificationDate", e.target.value)}
            startContent={<FaBell className="text-default-400 text-sm" />}
            size="sm"
            isInvalid={!!errors.notificationDate}
            errorMessage={errors.notificationDate}
          />
          <Select
            label="Notification Time"
            placeholder="Select time"
            selectedKeys={taskData.notificationTime ? [taskData.notificationTime] : []}
            onChange={(e) => onInputChange("notificationTime", e.target.value)}
            startContent={<FaBell className="text-default-400 text-sm" />}
            size="sm"
            isInvalid={!!errors.notificationTime}
            errorMessage={errors.notificationTime}
          >
            {generateTimeOptions().map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Second column - Description and selections */}
        <div className="space-y-2 md:col-span-2">
          <Textarea
            label="Description"
            placeholder="Enter task description"
            value={taskData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            size="sm"
            minRows={2}
            maxRows={4}
            isInvalid={!!errors.description}
            errorMessage={errors.description}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Select
                label="Priority"
                placeholder="Select priority"
                selectedKeys={[taskData.priority]}
                onChange={(e) => onInputChange("priority", e.target.value as "low" | "medium" | "high")}
                size="sm"
                isInvalid={!!errors.priority}
                errorMessage={errors.priority}
              >
                <SelectItem key="low" value="low">
                  <Chip color="success" size="sm">Low Priority</Chip>
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  <Chip color="warning" size="sm">Medium Priority</Chip>
                </SelectItem>
                <SelectItem key="high" value="high">
                  <Chip color="danger" size="sm">High Priority</Chip>
                </SelectItem>
              </Select>
              <div className="mt-2">
                <Chip color={getPriorityColor(taskData.priority)} size="sm">
                  Selected: {taskData.priority}
                </Chip>
              </div>
            </div>
            {isEditMode && (
              <div>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[taskData.status]}
                  onChange={(e) => onInputChange("status", e.target.value as "pending" | "in-progress" | "completed" | "not-completed")}
                  size="sm"
                >
                  <SelectItem key="pending" value="pending">
                    <Chip color="warning" size="sm">Pending</Chip>
                  </SelectItem>
                  <SelectItem key="in-progress" value="in-progress">
                    <Chip color="primary" size="sm">In Progress</Chip>
                  </SelectItem>
                  <SelectItem key="completed" value="completed">
                    <Chip color="success" size="sm">Completed</Chip>
                  </SelectItem>
                  <SelectItem key="not-completed" value="not-completed">
                    <Chip color="danger" size="sm">Not Completed</Chip>
                  </SelectItem>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment section - shown only in profile context */}
      {context === "profile" && (
        <div className="space-y-3 border-t pt-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={showUserSelect}
                onChange={(e) => setShowUserSelect(e.target.checked)}
                className="rounded"
              />
              Assign to Network
            </label>
          </div>

          {showUserSelect && (
            <div>
              {users.length > 0 ? (
                <>
                  <Select
                    label="Assign to Your Network"
                    placeholder="Select a user"
                    selectionMode="single"
                    selectedKeys={taskData.assignedUsers}
                    onChange={(e) => onInputChange("assignedUsers", e.target.value ? new Set([e.target.value]) : new Set())}
                    size="sm"
                  >
                    {users.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {renderSelectedItems(taskData.assignedUsers, "user")}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No active connections available</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3">
        <Button variant="flat" onPress={onCancel} size="sm">
          Cancel
        </Button>
        <Button color="primary" onPress={onSubmit} size="sm">
          {isEditMode ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;