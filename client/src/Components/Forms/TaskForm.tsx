import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@nextui-org/react";

import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

import { taskSchema, TaskFormValues } from "../../validation/taskValidation";
import TaskOverviewSection from "../User/TaskManagement/TaskForm/TaskOverviewSection";
import ScheduleSection from "../User/TaskManagement/TaskForm/ScheduleSection";
import PriorityStatusSection from "../User/TaskManagement/TaskForm/PriorityStatusSection";
import AssignmentSection from "../User/TaskManagement/TaskForm/AssignmentSection";

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
  showUserSelect = false,
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
    const options: string[] = [];
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setValue("taskImage", file, { shouldValidate: true });
    trigger("taskImage");
  };

  const onFormSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      await onSubmit(data, showUserSelect);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <Card className="w-full max-w-5xl bg-white/95 shadow-2xl rounded-3xl">
        <CardHeader className="flex justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-blue-700">
              {isEditMode ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditMode ? "Update your task details" : "Fill in the details to create a task"}
            </p>
          </div>

          <Button
            isIconOnly
            variant="light"
            onPress={onCancel}
            className="rounded-full hover:bg-white/70"
          >
            <FaTimes className="text-gray-700" />
          </Button>
        </CardHeader>

        <Divider />

        <CardBody className="px-8 py-6 overflow-y-auto max-h-[calc(100vh-180px)]">

          <TaskOverviewSection
            register={register}
            errors={errors}
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
          />

          <Divider className="my-6" />

          <ScheduleSection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            generateTimeOptions={generateTimeOptions}
          />

          <Divider className="my-6" />

          <PriorityStatusSection
            watch={watch}
            setValue={setValue}
            isEditMode={isEditMode}
            errors={errors}
          />

          {context === "user" && (
            <>
              <Divider className="my-6" />

              <AssignmentSection
                users={users}
                selectedUsers={selectedUsers}
                setValue={setValue}
                showUserSelect={showUserSelect}
                setShowUserSelect={setShowUserSelect!}
                canEditAssignment={canEditAssignment}
              />
            </>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="flat" onPress={onCancel} isDisabled={isSubmitting}>
              Cancel
            </Button>

            <Button
              color="primary"
              onPress={() => handleSubmit(onFormSubmit)()}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TaskForm;
