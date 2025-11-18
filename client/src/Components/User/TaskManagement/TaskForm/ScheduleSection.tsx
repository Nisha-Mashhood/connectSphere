import { Input, Select, SelectItem } from "@nextui-org/react";
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FaBell, FaCalendar } from "react-icons/fa";
import { TaskFormValues } from "../../../../validation/taskValidation";

interface ScheduleSectionProps {
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  watch: UseFormWatch<TaskFormValues>;
  setValue: UseFormSetValue<TaskFormValues>;
  generateTimeOptions: () => string[];
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  register,
  errors,
  watch,
  setValue,
  generateTimeOptions,
}) => {
  return (
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
          isInvalid={!!errors.startDate}
          errorMessage={errors.startDate?.message}
          variant="bordered"
        />
        <Input
          type="date"
          label="Due Date"
          {...register("dueDate")}
          startContent={<FaCalendar className="text-pink-500" />}
          isInvalid={!!errors.dueDate}
          errorMessage={errors.dueDate?.message}
          variant="bordered"
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
            isInvalid={!!errors.notificationDate}
            errorMessage={errors.notificationDate?.message}
            variant="bordered"
          />

          <Select
            label="Notification Time"
            selectedKeys={watch("notificationTime") ? [watch("notificationTime")] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              setValue("notificationTime", value, { shouldValidate: true });
            }}
          >
            {generateTimeOptions().map((t) => (
              <SelectItem key={t}>{t}</SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
