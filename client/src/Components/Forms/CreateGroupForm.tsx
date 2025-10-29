import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@nextui-org/react";
import TextField from "../ReusableComponents/TextFiled";
import NumberField from "../ReusableComponents/NumberField";
import TextArea from "../ReusableComponents/TextArea";
import BaseModal from "../ReusableComponents/BaseModal";
import AvailableSlotSelector, { Slot } from "../ReusableComponents/AvailableSlotSelector";
import { formatCurrency } from "../../pages/User/Profile/helper";
import { useCreateGroup } from "../../Hooks/User/useCreateGroup";
import {
  createGroupSchema,
  GroupFormValues,
} from "../../validation/createGroupValidation";

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const { handleCreateGroup, isLoading } = useCreateGroup();
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotError, setSlotError] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: yupResolver(createGroupSchema),
    defaultValues: {
      name: "",
      bio: "",
      price: 0,
      maxMembers: 4,
      availableSlots: [],
      startDate: "",
    },
    mode: "onChange",
  });

  // keep form field in sync with local state
  const onSlotsChange = (slots: Slot[]) => {
    setAvailableSlots(slots);
    setValue("availableSlots", slots, { shouldValidate: true });
  };


  const onSubmit: SubmitHandler<GroupFormValues> = () => {
    if (availableSlots.length === 0) {
      setSlotError("Please add at least one slot");
      return;
    }
    setSlotError("");
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async () => {
    setIsConfirmModalOpen(false);
    const data = watch();
    await handleCreateGroup(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Create New Group
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <TextField
              label="Group Name"
              placeholder="Enter group name"
              registration={register("name")}
              error={errors.name}
            />

            <TextArea
              label="Bio"
              placeholder="Write a brief group description"
              registration={register("bio")}
              error={errors.bio}
            />

            <TextField
              label="Start Date"
              type="date"
              registration={register("startDate")}
              error={errors.startDate}
            />

            <NumberField
              label="Price (optional)"
              min={0}
              registration={register("price", { valueAsNumber: true })}
              error={errors.price}
            />

            <NumberField
              label="Maximum Members"
              min={2}
              max={4}
              registration={register("maxMembers", { valueAsNumber: true })}
              error={errors.maxMembers}
            />
          </div>

          {/* Right Column – Time Slots */}
          <div className="space-y-4">
            <AvailableSlotSelector
              availableSlots={availableSlots}
              onSlotsChange={onSlotsChange}
              error={slotError}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onPress={() => navigate("/profile")}
            variant="light"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            Create Group
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <BaseModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Group Creation"
        onSubmit={confirmCreate}
        actionText="Confirm"
        cancelText="Cancel"
        size="sm"
      >
        <p className="font-semibold">{watch("name")}</p>
        <p className="text-sm text-gray-600">{watch("bio").slice(0, 100)}...</p>
        <p className="text-sm">
          Members: {watch("maxMembers")} | Price:{" "}
          {formatCurrency(Number(watch("price")))} | Starts: {watch("startDate")}
        </p>
        <p className="text-sm mt-2">
          This action is <strong>irreversible</strong>. Proceed?
        </p>
      </BaseModal>
    </div>
  );
};

export default CreateGroupForm;