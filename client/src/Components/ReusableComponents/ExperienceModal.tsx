import { FC, useEffect } from "react";
import BaseModal from "./BaseModal";
import TextField from "./TextFiled";
import TextArea from "./TextArea";
import { Checkbox, Input } from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  MentorExperienceInput,
  mentorExperienceSchema,
} from "../../validation/becomeMentorValidation";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MentorExperienceInput) => void;
  initialData?: MentorExperienceInput | null;
}

const ExperienceModal: FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<MentorExperienceInput>({
    resolver: yupResolver(mentorExperienceSchema),
    defaultValues: initialData || {
      role: "",
      organization: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    },
  });

  const isCurrent = watch("isCurrent");

  useEffect(() => {
    if (initialData) {
      reset({
        role: initialData.role || "",
        organization: initialData.organization || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        isCurrent: initialData.isCurrent || false,
        description: initialData.description || "",
      });
    } else {
      reset({
        role: "",
        organization: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: MentorExperienceInput) => {
    if (!data.startDate) {
      setError("startDate", {
        type: "manual",
        message: "Start date is required",
      });
      return;
    }
    const start = new Date(`${data.startDate}-01`);
    const end = data.endDate ? new Date(`${data.endDate}-01`) : null;
    const now = new Date();

    if (start > now) {
      setError("startDate", {
        type: "manual",
        message: "Start date cannot be in the future",
      });
      return;
    }

    if (end && end < start) {
      setError("endDate", {
        type: "manual",
        message: "End date cannot be before start date",
      });
      return;
    }

    if (end && end > now) {
      setError("endDate", {
        type: "manual",
        message: "End date cannot be in the future",
      });
      return;
    }
    onSave(data);
    onSave(data);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Experience" : "Add Experience"}
      onSubmit={handleSubmit(onSubmitForm)}
      actionText={initialData ? "Update" : "Add"}
      size="lg"
    >
      <div className="space-y-4">
        <TextField
          label="Role / Designation"
          placeholder="e.g., Senior React Developer"
          registration={register("role")}
          error={errors.role}
        />

        <TextField
          label="Organization"
          placeholder="e.g., Google, Freelancer"
          registration={register("organization")}
          error={errors.organization}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="month"
            label="Start Date"
            {...register("startDate")}
            errorMessage={errors.startDate?.message}
            isInvalid={!!errors.startDate}
          />

          {!isCurrent && (
            <Input
              type="month"
              label="End Date"
              {...register("endDate")}
              errorMessage={errors.endDate?.message}
              isInvalid={!!errors.endDate}
            />
          )}
        </div>

        <Controller
          name="isCurrent"
          control={control}
          render={({ field }) => (
            <Checkbox isSelected={field.value} onValueChange={field.onChange}>
              I am currently working here
            </Checkbox>
          )}
        />

        <TextArea
          label="Description (Optional)"
          placeholder="Briefly describe your responsibilities and achievements"
          registration={register("description")}
          error={errors.description}
        />
      </div>
    </BaseModal>
  );
};

export default ExperienceModal;
