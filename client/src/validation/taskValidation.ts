import * as Yup from "yup";
import { required, minLength, maxLength } from "./validationRules";

export interface TaskFormValues {
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  dueDate: string;
  notificationDate: string;
  notificationTime: string;
  status: "pending" | "in-progress" | "completed" | "not-completed";
  assignedUsers: string[];
  taskImage: File | null;
  taskImagePreview?: string;
}

export const taskSchema = Yup.object({
  name: required("Task name is required")
    .concat(minLength(3, "Name must be at least 3 characters"))
    .concat(maxLength(100, "Name cannot exceed 100 characters")),

  description: required("Description is required")
    .concat(minLength(10, "Description must be at least 10 characters"))
    .concat(maxLength(1000, "Description cannot exceed 1000 characters")),

  priority: Yup.mixed<"low" | "medium" | "high">()
    .oneOf(["low", "medium", "high"], "Invalid priority")
    .required("Priority is required"),

  startDate: required("Start date is required"),

  dueDate: required("Due date is required").test(
    "after-start",
    "Due date must be after start date",
    function (value) {
      const { startDate } = this.parent;
      return !startDate || !value || new Date(value) >= new Date(startDate);
    }
  ),

  notificationDate: required("Notification date is required").test(
    "between-start-and-due",
    "Notification date must be between start date and due date",
    function (value) {
      const { startDate, dueDate } = this.parent;
      if (!value || !startDate || !dueDate) return true;
      const notification = new Date(value);
      const start = new Date(startDate);
      const due = new Date(dueDate);
      return notification >= start && notification <= due;
    }
  ),

  notificationTime: required("Notification time is required"),

  status: Yup.mixed<"pending" | "in-progress" | "completed" | "not-completed">()
    .oneOf(["pending", "in-progress", "completed", "not-completed"])
    .required("Status is required"),

  assignedUsers: Yup.array().of(Yup.string()).min(0),

  taskImage: Yup.mixed<File>()
    .nullable()
    .test("file-size", "Image must be under 5MB", (value) => {
      return !value || value.size <= 5 * 1024 * 1024;
    })
    .test("file-type", "Only image files are allowed", (value) => {
      return !value || value.type.startsWith("image/");
    }),
}).required();
