import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Button,
  Card,
  CardBody,
} from "@nextui-org/react";
import { FaCalendar, FaBell, FaImage } from "react-icons/fa";
import toast from "react-hot-toast";
import { taskSchema, TaskFormValues } from "../../validation/taskValidation";

interface TaskFormProps {
  initialData?: Partial<TaskFormValues & { taskImagePreview?: string }>;
  users: { userId: string; name: string }[];
  context: "profile" | "group" | "collaboration";
  isEditMode: boolean;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {},
  users,
  context,
  isEditMode,
  onSubmit,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showUserSelect, setShowUserSelect] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<TaskFormValues>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "medium",
      startDate: "",
      dueDate: "",
      notificationDate: "",
      notificationTime: "",
      status: "pending",
      assignedUsers: [],
      taskImage: null,
      ...initialData,
    },
    mode: "onChange",
  });

  const watchedImage = watch("taskImage");
  const selectedUsers = watch("assignedUsers") || [];

  // Image preview
  useEffect(() => {
    if (watchedImage) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(watchedImage);
    } else if (initialData.taskImagePreview) {
      setImagePreview(initialData.taskImagePreview);
    } else {
      setImagePreview("");
    }
  }, [watchedImage, initialData.taskImagePreview]);

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

  // Fixed: Handle single File
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setValue("taskImage", file, { shouldValidate: true });
    trigger("taskImage");
  };

  const onFormSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      await onSubmit(data);
      // toast.success(isEditMode ? "Task updated!" : "Task created!");
    } catch (error) {
      console.error("Task submission error:", error);
      toast.error(error.message || "Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <Card className="w-full max-w-6xl mx-auto p-4 bg-white rounded-2xl shadow-xl">
        <CardBody>
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Header: Name + Image */}
            <div className="flex flex-col w-full lg:w-1/2 gap-4">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    label="Task Name"
                    placeholder="Enter task name"
                    {...register("name")}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    size="sm"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="file"
                    accept="image/*"
                    id="task-image"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="task-image"
                    className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Task preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <FaImage className="text-xl text-gray-500" />
                        <span className="mt-1 text-xs text-gray-600">
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
                {...register("description")}
                minRows={5}
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
              />
            </div>

            {/* Dates & Time */}
            <div className="flex flex-col w-full lg:w-1/2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  label="Start Date"
                  {...register("startDate")}
                  startContent={
                    <FaCalendar className="text-default-400 text-sm" />
                  }
                  size="sm"
                  isInvalid={!!errors.startDate}
                  errorMessage={errors.startDate?.message}
                />
                <Input
                  type="date"
                  label="Due Date"
                  {...register("dueDate")}
                  startContent={
                    <FaCalendar className="text-default-400 text-sm" />
                  }
                  size="sm"
                  isInvalid={!!errors.dueDate}
                  errorMessage={errors.dueDate?.message}
                />
                <Input
                  type="date"
                  label="Notification Date"
                  {...register("notificationDate")}
                  startContent={<FaBell className="text-default-400 text-sm" />}
                  size="sm"
                  isInvalid={!!errors.notificationDate}
                  errorMessage={errors.notificationDate?.message}
                />
                <Select
                  label="Notification Time"
                  placeholder="Select time"
                  selectedKeys={
                    watch("notificationTime") ? [watch("notificationTime")] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setValue("notificationTime", value, {
                      shouldValidate: true,
                    });
                  }}
                  size="sm"
                  isInvalid={!!errors.notificationTime}
                  errorMessage={errors.notificationTime?.message}
                >
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Description + Priority/Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Select
                    label="Priority"
                    selectedKeys={[watch("priority")]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as
                        | "low"
                        | "medium"
                        | "high";
                      setValue("priority", value, { shouldValidate: true });
                    }}
                    size="sm"
                    isInvalid={!!errors.priority}
                    errorMessage={errors.priority?.message}
                  >
                    <SelectItem key="low">
                      <Chip color="success" size="sm">
                        Low
                      </Chip>
                    </SelectItem>
                    <SelectItem key="medium">
                      <Chip color="warning" size="sm">
                        Medium
                      </Chip>
                    </SelectItem>
                    <SelectItem key="high">
                      <Chip color="danger" size="sm">
                        High
                      </Chip>
                    </SelectItem>
                  </Select>
                  <div>
                    <Chip color={getPriorityColor(watch("priority"))} size="sm">
                      Selected: {watch("priority")}
                    </Chip>
                  </div>

                  {isEditMode && (
                    <Select
                      label="Status"
                      selectedKeys={[watch("status")]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(
                          keys
                        )[0] as TaskFormValues["status"];
                        setValue("status", value);
                      }}
                      size="sm"
                    >
                      <SelectItem key="pending">
                        <Chip color="warning" size="sm">
                          Pending
                        </Chip>
                      </SelectItem>
                      <SelectItem key="in-progress">
                        <Chip color="primary" size="sm">
                          In Progress
                        </Chip>
                      </SelectItem>
                      <SelectItem key="completed">
                        <Chip color="success" size="sm">
                          Completed
                        </Chip>
                      </SelectItem>
                      <SelectItem key="not-completed">
                        <Chip color="danger" size="sm">
                          Not Completed
                        </Chip>
                      </SelectItem>
                    </Select>
                  )}
                </div>
              </div>

              {/* Assign Users (Profile Only) */}
              {context === "profile" && (
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={showUserSelect}
                      onChange={(e) => setShowUserSelect(e.target.checked)}
                      className="rounded"
                    />
                    Assign to Network
                  </label>

                  {showUserSelect && (
                    <div className="mt-3">
                      {users.length > 0 ? (
                        <>
                          <Select
                            label="Select User"
                            selectionMode="multiple"
                            selectedKeys={selectedUsers}
                            onSelectionChange={(keys) => {
                              const arr = Array.from(keys) as string[];
                              setValue("assignedUsers", arr, {
                                shouldValidate: true,
                              });
                            }}
                            size="sm"
                          >
                            {users.map((user) => (
                              <SelectItem key={user.userId} value={user.userId}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </Select>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedUsers.map((id) => {
                              const user = users.find((u) => u.userId === id);
                              return user ? (
                                <Chip key={id} color="primary" size="sm">
                                  {user.name}
                                </Chip>
                              ) : null;
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No connections available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="flat"
                  onPress={onCancel}
                  size="sm"
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  {isEditMode ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default TaskForm;
