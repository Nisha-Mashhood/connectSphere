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
  CardHeader,
  Divider,
} from "@nextui-org/react";
import { FaCalendar, FaBell, FaImage, FaTimes, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";
import { taskSchema, TaskFormValues } from "../../validation/taskValidation";

interface TaskFormProps {
  initialData?: Partial<TaskFormValues & { taskImagePreview?: string }>;
  users: { userId: string; name: string }[];
  context: "user" | "group" | "collaboration";
  isEditMode: boolean;
  showUserSelect?: boolean;
  setShowUserSelect?: (v: boolean) => void;
  canEditAssignment?: boolean;
  onSubmit: (data: TaskFormValues, showUserSelect: boolean) => Promise<void>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {},
  users,
  context,
  isEditMode,
  showUserSelect,
  setShowUserSelect,
  canEditAssignment,
  onSubmit,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setValue("taskImage", file, { shouldValidate: true });
    trigger("taskImage");
  };

  const onFormSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      await onSubmit(data, showUserSelect);
    } catch (error) {
      console.error("Task submission error:", error);
      toast.error(error.message || "Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <CardHeader className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isEditMode ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? "Update your task details" : "Fill in the details to create a task"}
            </p>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onCancel}
            className="rounded-full hover:bg-white/50 transition-all"
          >
            <FaTimes className="text-gray-600" />
          </Button>
        </CardHeader>

        <Divider />

        <CardBody className="px-8 py-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-8">
            {/* Task Overview Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-1">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 ml-2">Task Overview</h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="task-image"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="task-image"
                    className="cursor-pointer group relative"
                  >
                    <div className="w-32 h-32 border-3 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 group-hover:scale-105 overflow-hidden shadow-sm">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Task preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <FaImage className="text-3xl text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <span className="text-xs text-gray-600 font-medium">Upload Image</span>
                          <span className="text-xs text-gray-400 mt-1">Optional</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Name and Description */}
                <div className="flex-1 space-y-4">
                  <Input
                    label="Task Name"
                    placeholder="Enter a clear, descriptive task name"
                    {...register("name")}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    size="lg"
                    variant="bordered"
                    classNames={{
                      input: "text-lg",
                      inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500 transition-colors",
                    }}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Describe what needs to be done..."
                    {...register("description")}
                    minRows={4}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description?.message}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500 transition-colors",
                    }}
                  />
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Schedule Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-1">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 ml-2">Schedule & Dates</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Start Date"
                  {...register("startDate")}
                  startContent={<FaCalendar className="text-purple-500" />}
                  size="lg"
                  variant="bordered"
                  isInvalid={!!errors.startDate}
                  errorMessage={errors.startDate?.message}
                  classNames={{
                    inputWrapper: "border-2 hover:border-purple-400 focus-within:border-purple-500 transition-colors",
                  }}
                />
                <Input
                  type="date"
                  label="Due Date"
                  {...register("dueDate")}
                  startContent={<FaCalendar className="text-pink-500" />}
                  size="lg"
                  variant="bordered"
                  isInvalid={!!errors.dueDate}
                  errorMessage={errors.dueDate?.message}
                  classNames={{
                    inputWrapper: "border-2 hover:border-pink-400 focus-within:border-pink-500 transition-colors",
                  }}
                />
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaBell className="text-amber-600 text-lg" />
                  <h4 className="font-semibold text-gray-800">Notification Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Notification Date"
                    {...register("notificationDate")}
                    size="lg"
                    variant="bordered"
                    isInvalid={!!errors.notificationDate}
                    errorMessage={errors.notificationDate?.message}
                    classNames={{
                      inputWrapper: "bg-white border-2 hover:border-amber-400 focus-within:border-amber-500 transition-colors",
                    }}
                  />
                  <Select
                    label="Notification Time"
                    placeholder="Select time"
                    selectedKeys={watch("notificationTime") ? [watch("notificationTime")] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setValue("notificationTime", value, { shouldValidate: true });
                    }}
                    size="lg"
                    variant="bordered"
                    isInvalid={!!errors.notificationTime}
                    errorMessage={errors.notificationTime?.message}
                    classNames={{
                      trigger: "bg-white border-2 hover:border-amber-400 data-[hover=true]:border-amber-400",
                    }}
                  >
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Priority & Status Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-1">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 ml-2">Priority & Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Select
                    label="Priority Level"
                    selectedKeys={[watch("priority")]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as "low" | "medium" | "high";
                      setValue("priority", value, { shouldValidate: true });
                    }}
                    size="lg"
                    variant="bordered"
                    isInvalid={!!errors.priority}
                    errorMessage={errors.priority?.message}
                    classNames={{
                      trigger: "border-2 hover:border-green-400 data-[hover=true]:border-green-400",
                    }}
                  >
                    <SelectItem key="low" textValue="low">
                      <Chip color="success" size="md" variant="flat">Low Priority</Chip>
                    </SelectItem>
                    <SelectItem key="medium" textValue="medium">
                      <Chip color="warning" size="md" variant="flat">Medium Priority</Chip>
                    </SelectItem>
                    <SelectItem key="high" textValue="high">
                      <Chip color="danger" size="md" variant="flat">High Priority</Chip>
                    </SelectItem>
                  </Select>
                  <div className="flex items-center gap-2 pl-1">
                    <span className="text-sm text-gray-600">Selected:</span>
                    <Chip color={getPriorityColor(watch("priority"))} size="md" variant="shadow">
                      {watch("priority").charAt(0).toUpperCase() + watch("priority").slice(1)}
                    </Chip>
                  </div>
                </div>

                {isEditMode && (
                  <div className="space-y-4">
                    <Select
                      label="Task Status"
                      selectedKeys={[watch("status")]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as TaskFormValues["status"];
                        setValue("status", value);
                      }}
                      size="lg"
                      variant="bordered"
                      classNames={{
                        trigger: "border-2 hover:border-blue-400 data-[hover=true]:border-blue-400",
                      }}
                    >
                      <SelectItem key="pending" textValue="pending">
                        <Chip color="warning" size="md" variant="flat">⏳ Pending</Chip>
                      </SelectItem>
                      <SelectItem key="in-progress" textValue="in-progress">
                        <Chip color="primary" size="md" variant="flat">🚀 In Progress</Chip>
                      </SelectItem>
                      <SelectItem key="completed" textValue="completed">
                        <Chip color="success" size="md" variant="flat">✓ Completed</Chip>
                      </SelectItem>
                      <SelectItem key="not-completed" textValue="not-completed">
                        <Chip color="danger" size="md" variant="flat">✗ Not Completed</Chip>
                      </SelectItem>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Section */}
            {context === "user" && (
              <>
                <Divider className="my-6" />
                <div className="space-y-4">
                  <div className="flex items-start gap-1">
                    <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-2">Assignment</h3>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border-2 border-cyan-200">
                    <label
                      className={`flex items-center gap-3 select-none ${
                        !canEditAssignment ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={showUserSelect ?? false}
                        disabled={!canEditAssignment}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setShowUserSelect?.(checked);
                          if (!checked) {
                            setValue("assignedUsers", [], { shouldValidate: true });
                          }
                        }}
                        className={`w-5 h-5 rounded-lg transition-all ${
                          !canEditAssignment
                            ? "cursor-not-allowed"
                            : "cursor-pointer accent-cyan-600"
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-cyan-600 text-lg" />
                        <span className="font-medium text-gray-800">Assign to Network</span>
                      </div>
                    </label>

                    {showUserSelect && canEditAssignment && (
                      <div className="mt-4 space-y-3">
                        {users.length > 0 ? (
                          <>
                            <Select
                              label="Select Users"
                              selectionMode="multiple"
                              selectedKeys={selectedUsers}
                              onSelectionChange={(keys) => {
                                const arr = Array.from(keys) as string[];
                                setValue("assignedUsers", arr, { shouldValidate: true });
                              }}
                              size="lg"
                              variant="bordered"
                              placeholder="Choose users to assign..."
                              classNames={{
                                trigger: "bg-white border-2 hover:border-cyan-400 data-[hover=true]:border-cyan-400",
                              }}
                            >
                              {users.map((u) => (
                                <SelectItem key={u.userId} value={u.userId}>
                                  {u.name}
                                </SelectItem>
                              ))}
                            </Select>
                            {selectedUsers.length > 0 && (
                              <div className="bg-white rounded-xl p-3 border border-cyan-200">
                                <p className="text-xs font-medium text-gray-600 mb-2">
                                  Assigned Users ({selectedUsers.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedUsers.map((id) => {
                                    const user = users.find((u) => u.userId === id);
                                    return user ? (
                                      <Chip
                                        key={id}
                                        color="primary"
                                        size="md"
                                        variant="flat"
                                        className="shadow-sm"
                                      >
                                        {user.name}
                                      </Chip>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-white rounded-xl p-4 border border-cyan-200 text-center">
                            <p className="text-gray-500 text-sm">No connections available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
              <Button
                variant="flat"
                onPress={onCancel}
                size="lg"
                isDisabled={isSubmitting}
                className="font-medium px-8 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onPress={() => handleSubmit(onFormSubmit)()}
                color="primary"
                size="lg"
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                className="font-medium px-8 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all"
              >
                {isEditMode ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TaskForm;