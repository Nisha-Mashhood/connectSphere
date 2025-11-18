import { Select, SelectItem, Chip } from "@nextui-org/react";
import {
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { TaskFormValues } from "../../../../validation/taskValidation";

interface PriorityStatusSectionProps {
  watch: UseFormWatch<TaskFormValues>;
  setValue: UseFormSetValue<TaskFormValues>;
  isEditMode: boolean;
  errors: FieldErrors<TaskFormValues>;
}

const PriorityStatusSection: React.FC<PriorityStatusSectionProps> = ({
  watch,
  setValue,
  isEditMode,
  errors,
}) => {
  const priority = watch("priority");
  const status = watch("status");

  const getPriorityColor = (p: string) => {
    switch (p) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-1">
        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 ml-2">
          Priority & Status
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <Select
            label="Priority Level"
            selectedKeys={[priority]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as TaskFormValues["priority"];
              setValue("priority", value, { shouldValidate: true });
            }}
            isInvalid={!!errors.priority}
            errorMessage={errors.priority?.message}
            variant="bordered"
          >
            <SelectItem key="low">
              <Chip color="success" variant="flat">Low Priority</Chip>
            </SelectItem>
            <SelectItem key="medium">
              <Chip color="warning" variant="flat">Medium Priority</Chip>
            </SelectItem>
            <SelectItem key="high">
              <Chip color="danger" variant="flat">High Priority</Chip>
            </SelectItem>
          </Select>

          <div className="flex items-center gap-2 pl-1">
            <span className="text-sm text-gray-600">Selected:</span>
            <Chip color={getPriorityColor(priority)} variant="shadow">
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Chip>
          </div>
        </div>


        {isEditMode && (
          <Select
            label="Task Status"
            selectedKeys={[status]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as TaskFormValues["status"];
              setValue("status", value, { shouldValidate: true });
            }}
            isInvalid={!!errors.status}
            errorMessage={errors.status?.message}
            variant="bordered"
          >
            <SelectItem key="pending">⏳ Pending</SelectItem>
            <SelectItem key="in-progress">🚀 In Progress</SelectItem>
            <SelectItem key="completed">✓ Completed</SelectItem>
            <SelectItem key="not-completed">✗ Not Completed</SelectItem>
          </Select>
        )}
      </div>
    </div>
  );
};

export default PriorityStatusSection;
