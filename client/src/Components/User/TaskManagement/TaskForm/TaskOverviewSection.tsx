import { Input, Textarea } from "@nextui-org/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { FaImage } from "react-icons/fa";
import { TaskFormValues } from "../../../../validation/taskValidation";

interface TaskOverviewProps {
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  imagePreview: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TaskOverviewSection: React.FC<TaskOverviewProps> = ({
  register,
  errors,
  imagePreview,
  handleImageChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-1">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 ml-2">Task Overview</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        <div className="flex flex-col items-center gap-3">
          <input type="file" accept="image/*" id="task-image" className="hidden" onChange={handleImageChange} />

          <label htmlFor="task-image" className="cursor-pointer group relative">
            <div className="w-32 h-32 border-3 border-dashed border-gray-300 rounded-2xl 
                hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center 
                bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 
                group-hover:scale-105 overflow-hidden shadow-sm"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <FaImage className="text-3xl text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">Upload Image</span>
                </>
              )}
            </div>
          </label>
        </div>


        <div className="flex-1 space-y-4">
          <Input
            label="Task Name"
            placeholder="Enter task name"
            {...register("name")}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            size="lg"
            variant="bordered"
          />

          <Textarea
            label="Description"
            placeholder="Describe the task..."
            {...register("description")}
            isInvalid={!!errors.description}
            errorMessage={errors.description?.message}
            minRows={4}
            variant="bordered"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskOverviewSection;
