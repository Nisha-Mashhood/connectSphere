import React from "react";
import { Input, Textarea, Select, SelectItem, Chip, Button } from "@nextui-org/react";
import { FaCalendar, FaBell, FaImage } from "react-icons/fa";

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

interface TaskFormProps {
  taskData: ITaskData;
  errors: ITaskErrors;
  groups: any[];
  collaborations: any[];
  showGroupSelect: boolean;
  showCollabSelect: boolean;
  context: string;
  isEditMode: boolean;
  onInputChange: (field: keyof ITaskData, value: any) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowGroupSelect: (value: boolean) => void;
  setShowCollabSelect: (value: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  taskData,
  errors,
  groups,
  collaborations,
  showGroupSelect,
  showCollabSelect,
  context,
  isEditMode,
  onInputChange,
  onImageChange,
  setShowGroupSelect,
  setShowCollabSelect,
  onSubmit,
  onCancel,
}) => {
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
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const renderCollaborationName = (collab: any) =>
    collab.userId?.name || collab.mentorId?.userId?.name || "Unnamed";

  const renderSelectedItems = (items: Set<string>, itemType: "group" | "collab") => {
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <Input
            label="Task Name"
            placeholder="Enter task name"
            value={taskData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
          />
          {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
        </div>
        <div className="w-32">
          <input
            type="file"
            accept="image/*"
            id={`task-image-${isEditMode ? "edit" : "create"}`}
            className="hidden"
            onChange={onImageChange}
          />
          <label
            htmlFor={`task-image-${isEditMode ? "edit" : "create"}`}
            className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-50"
          >
            {taskData.taskImagePreview ? (
              <img src={taskData.taskImagePreview} alt="Task Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <>
                <FaImage className="text-2xl text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
              </>
            )}
          </label>
          {errors.taskImage && <span className="text-red-500 text-sm mt-1 block">{errors.taskImage}</span>}
        </div>
      </div>

      <Textarea
        label="Description"
        placeholder="Enter task description"
        value={taskData.description}
        onChange={(e) => onInputChange("description", e.target.value)}
      />
      {errors.description && <span className="text-red-500 text-sm mt-1 block">{errors.description}</span>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="date"
            label="Start Date"
            placeholder="Select start date"
            value={taskData.startDate}
            onChange={(e) => onInputChange("startDate", e.target.value)}
            startContent={<FaCalendar className="text-default-400" />}
          />
          {errors.startDate && <span className="text-red-500 text-sm mt-1 block">{errors.startDate}</span>}
        </div>

        <div>
          <Input
            type="date"
            label="Due Date"
            placeholder="Select due date"
            value={taskData.dueDate}
            onChange={(e) => onInputChange("dueDate", e.target.value)}
            startContent={<FaCalendar className="text-default-400" />}
          />
          {errors.dueDate && <span className="text-red-500 text-sm mt-1 block">{errors.dueDate}</span>}
        </div>

        <div>
          <Input
            type="date"
            label="Notification Date"
            placeholder="Select notification date"
            value={taskData.notificationDate}
            onChange={(e) => onInputChange("notificationDate", e.target.value)}
            startContent={<FaBell className="text-default-400" />}
          />
          {errors.notificationDate && <span className="text-red-500 text-sm mt-1 block">{errors.notificationDate}</span>}
        </div>

        <div>
          <Select
            label="Notification Time"
            placeholder="Select notification time"
            value={taskData.notificationTime}
            onChange={(e) => onInputChange("notificationTime", e.target.value)}
            startContent={<FaBell className="text-default-400" />}
          >
            {generateTimeOptions().map((time) => (
              <SelectItem key={time} value={time}>{time}</SelectItem>
            ))}
          </Select>
          {errors.notificationTime && <span className="text-red-500 text-sm mt-1 block">{errors.notificationTime}</span>}
        </div>
      </div>

      {isEditMode && (
        <Select
          label="Status"
          selectedKeys={[taskData.status]}
          onChange={(e) => onInputChange("status", e.target.value as "pending" | "in-progress" | "completed" | "not-completed")}
        >
          <SelectItem key="pending" value="pending"><Chip color="warning" size="sm">Pending</Chip></SelectItem>
          <SelectItem key="in-progress" value="in-progress"><Chip color="primary" size="sm">In Progress</Chip></SelectItem>
          <SelectItem key="completed" value="completed"><Chip color="success" size="sm">Completed</Chip></SelectItem>
          <SelectItem key="not-completed" value="not-completed"><Chip color="danger" size="sm">Not Completed</Chip></SelectItem>
        </Select>
      )}

      <Select
        label="Priority"
        selectedKeys={[taskData.priority]}
        onChange={(e) => onInputChange("priority", e.target.value as "low" | "medium" | "high")}
      >
        <SelectItem key="low" value="low"><Chip color="success" size="sm">Low Priority</Chip></SelectItem>
        <SelectItem key="medium" value="medium"><Chip color="warning" size="sm">Medium Priority</Chip></SelectItem>
        <SelectItem key="high" value="high"><Chip color="danger" size="sm">High Priority</Chip></SelectItem>
      </Select>
      {errors.priority && <span className="text-red-500 text-sm mt-1 block">{errors.priority}</span>}
      <div className="mt-2">
        <Chip color={getPriorityColor(taskData.priority)} size="sm">Selected Priority: {taskData.priority}</Chip>
      </div>

      {context === "profile" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showGroupSelect} onChange={(e) => setShowGroupSelect(e.target.checked)} className="rounded" />
              Assign to Groups
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showCollabSelect} onChange={(e) => setShowCollabSelect(e.target.checked)} className="rounded" />
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
                onChange={(e) => onInputChange("assignedGroups", new Set(e.target.value.split(",")))}
              >
                {groups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
                ))}
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">{renderSelectedItems(taskData.assignedGroups, "group")}</div>
            </>
          )}

          {showCollabSelect && collaborations.length > 0 && (
            <>
              <Select
                label="Select Collaborations"
                selectionMode="multiple"
                placeholder="Choose collaborations to assign"
                selectedKeys={taskData.assignedCollaborations}
                onChange={(e) => onInputChange("assignedCollaborations", new Set(e.target.value.split(",")))}
              >
                {collaborations.map((collab) => (
                  <SelectItem key={collab._id} value={collab._id}>{renderCollaborationName(collab)}</SelectItem>
                ))}
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">{renderSelectedItems(taskData.assignedCollaborations, "collab")}</div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="flat" onPress={onCancel}>Cancel</Button>
        <Button color="primary" onPress={onSubmit}>{isEditMode ? "Update Task" : "Create Task"}</Button>
      </div>
    </div>
  );
};

export default TaskForm;