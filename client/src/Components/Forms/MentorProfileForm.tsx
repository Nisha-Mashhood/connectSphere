import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllSkills } from "../../Service/Category.Service";
import { createMentorProfile } from "../../Service/Mentor.Service";
import { Skill } from "../../redux/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import TextField from "../ReusableComponents/TextFiled";
import NumberField from "../ReusableComponents/NumberField";
import TextArea from "../ReusableComponents/TextArea";
import AvailableSlotSelector, {
  Slot,
} from "../ReusableComponents/AvailableSlotSelector";
import toast from "react-hot-toast";
import {
  BecomeMentorFormValues,
  becomeMentorSchema,
  MentorExperienceInput,
} from "../../validation/becomeMentorValidation";
import ExperienceModal from "../ReusableComponents/ExperienceModal";
import { formatDate } from "../../pages/User/Profile/helper";

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // === Slot State ===
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotError, setSlotError] = useState<string>("");

  // === Skills Dropdown Modal ===
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  // === Experience State ===
  const [experiences, setExperiences] = useState<MentorExperienceInput[]>([]);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<MentorExperienceInput | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setSkills(data);
      } catch (error) {
        toast.error("Failed to fetch skills");
        console.error("Mentor Profile form:", error);
      }
    };
    if (currentUser.id) {
      fetchSkills();
    }
  }, [currentUser]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<BecomeMentorFormValues>({
    resolver: yupResolver(becomeMentorSchema),
    defaultValues: {
      specialization: "",
      bio: "",
      price: 0,
      timePeriod: 5,
      skills: [],
      certificates: [],
      availableSlots: [],
      experiences: [],
    },
    mode: "onChange",
  });

  const certificates = watch("certificates");
  const selectedSkills = watch("skills");

  // Sync slots with form
  const onSlotsChange = (slots: Slot[]) => {
    setAvailableSlots(slots);
    setValue("availableSlots", slots, { shouldValidate: true });
  };

  const handleSkillToggle = (skillId: string) => {
    const updated = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    setValue("skills", updated, { shouldValidate: true });
    trigger("skills");
  };

  const getSkillName = (skillId: string) => {
    const skill = skills.find((s) => s._id === skillId);
    return skill ? skill.name : "";
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast.error("You can only upload a maximum of 2 certificates.");
      setValue("certificates", [], { shouldValidate: true });
    } else {
      setValue("certificates", files, { shouldValidate: true });
    }
    trigger("certificates");
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setEditingIndex(null);
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (exp: MentorExperienceInput, index: number) => {
    setEditingExperience(exp);
    setEditingIndex(index);
    setIsExperienceModalOpen(true);
  };

  const handleDeleteExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    setValue("experiences", updated, { shouldValidate: true });
    trigger("experiences");
  };

  const handleSaveExperience = (data: MentorExperienceInput) => {
    let updated;
    if (editingIndex !== null) {
      // Edit existing
      updated = experiences.map((exp, i) =>
        i === editingIndex ? data : exp
      );
    } else {
      // Add new
      updated = [...experiences, data];
    }
    // Sort by startDate descending (most recent first)
    updated.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    setExperiences(updated);
    setValue("experiences", updated, { shouldValidate: true });
    trigger("experiences");
  };

  const onSubmit: SubmitHandler<BecomeMentorFormValues> = async (data) => {
    if (isLoading) return;

    if (availableSlots.length === 0) {
      setSlotError("Please add at least one available slot");
      return;
    }
    setSlotError("");

    const formData = new FormData();
    data.certificates.forEach((file) => formData.append("certificates", file));
    formData.append("userId", currentUser.id);
    formData.append("specialization", data.specialization);
    formData.append("bio", data.bio);
    formData.append("price", String(data.price));
    formData.append("skills", JSON.stringify(data.skills));
    formData.append("availableSlots", JSON.stringify(availableSlots));
    formData.append("timePeriod", data.timePeriod.toString());
    formData.append("experiences", JSON.stringify(data.experiences));

    try {
      setIsLoading(true);
      await createMentorProfile(formData);
      toast.success("Profile created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "An unexpected error occurred. Please try again later."
      );
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">
        Create Mentor Profile
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Specialization */}
        <TextField
          label="Specialization"
          description="e.g., React, Python, UI/UX"
          placeholder="Enter your specialization"
          registration={register("specialization")}
          error={errors.specialization}
        />

        {/* Bio */}
        <TextArea
          label="Bio"
          description="Write a brief introduction about yourself, your experience, and what students can expect."
          placeholder="Enter your bio"
          registration={register("bio")}
          error={errors.bio}
        />

        {/* Price */}

        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <NumberField
              label="Session Price (in ₹)"
              description="Set your total session's fee (min ₹101, ₹100 deducted as platform fee)."
              placeholder="Enter price"
              min={101}
              registration={register("price", { valueAsNumber: true })}
              error={errors.price}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Your earnings for whole session: ₹
            {watch("price") ? Number(watch("price")) - 100 : 0}
          </p>
        </div>

        {/* Time Period */}
        <TextField
          label="Number of Sessions"
          description="Specify how many sessions (min 5, one per week)."
          type="number"
          placeholder="e.g., 8"
          registration={register("timePeriod", { valueAsNumber: true })}
          error={errors.timePeriod}
        />

        {/* Skills – Dropdown on Click */}
        <div className="space-y-2">
          <label className="block font-medium">Skills</label>

          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSkills.length === 0 ? (
              <p className="text-sm text-gray-500">No skills selected</p>
            ) : (
              selectedSkills.map((skillId) => (
                <Chip
                  key={skillId}
                  onClose={() => handleSkillToggle(skillId)}
                  color="primary"
                  variant="flat"
                  size="sm"
                >
                  {getSkillName(skillId)}
                </Chip>
              ))
            )}
          </div>

          {/* Trigger Button */}
          <Button
            type="button"
            variant="bordered"
            onPress={() => setIsSkillsOpen(true)}
            className="w-full"
          >
            {selectedSkills.length > 0 ? "Edit Skills" : "Select Skills"}
          </Button>

          {errors.skills && (
            <p className="text-red-500 text-sm">{errors.skills.message}</p>
          )}
        </div>

        {/* Skills Modal */}
        <Modal
          isOpen={isSkillsOpen}
          onClose={() => setIsSkillsOpen(false)}
          size="lg"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>Select Your Skills</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <Button
                    key={skill._id}
                    variant={
                      selectedSkills.includes(skill._id) ? "solid" : "bordered"
                    }
                    color={
                      selectedSkills.includes(skill._id) ? "primary" : "default"
                    }
                    onPress={() => handleSkillToggle(skill._id)}
                    className="justify-start text-left"
                  >
                    {skill.name}
                  </Button>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setIsSkillsOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Certificates */}
        <div className="space-y-2">
          <label className="block font-medium">Certificates</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleCertificateUpload}
            className="w-full px-4 py-2 border rounded-md text-sm"
          />
          <p className="text-xs text-gray-500">
            Upload up to 2 certificates (PDF, JPG, PNG)
          </p>
          {errors.certificates && (
            <p className="text-red-500 text-sm">
              {errors.certificates.message}
            </p>
          )}

          {/* Preview */}
          <div className="mt-3 space-y-2">
            {certificates.map((file: File, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 border rounded-md text-sm"
              >
                <a
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== WORK EXPERIENCE SECTION ===== */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <p className="text-sm text-gray-600">
            Add your professional experience. Most recent first.
          </p>

          {/* Preview of Added Experiences */}
          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <p>No experiences added yet</p>
                <p className="text-sm mt-2">Click the button below to add your first experience</p>
              </div>
            ) : (
              experiences.map((exp, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => handleEditExperience(exp, index)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{exp.role}</p>
                    <p className="text-md text-gray-700">{exp.organization}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate || "")}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => {
                      handleDeleteExperience(index);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            color="primary"
            variant="bordered"
            onPress={handleAddExperience}
            startContent={<span className="text-lg">+</span>}
            className="w-full mt-4"
          >
            {experiences.length === 0 ? "Add Your First Experience" : "Add Another Experience"}
          </Button>

          {errors.experiences && (
            <p className="text-red-500 text-sm mt-2">{errors.experiences.message}</p>
          )}
        </div>

        {/* Experience Modal */}
        <ExperienceModal
          isOpen={isExperienceModalOpen}
          onClose={() => setIsExperienceModalOpen(false)}
          onSave={handleSaveExperience}
          initialData={editingExperience}
        />

        {/* Available Slots */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <label className="block font-medium text-lg">Available Slots</label>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
              Recurring Weekly
            </div>
          </div>
          
          <p className="text-sm text-gray-600 -mt-1">
            Your selected slots will repeat <strong>every week</strong> on the same day and time. 
            Students can book you on any future week in these slots.
          </p>
          
          <AvailableSlotSelector
            availableSlots={availableSlots}
            onSlotsChange={onSlotsChange}
            error={slotError}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          color="primary"
          size="lg"
          isLoading={isLoading}
          isDisabled={isLoading}
          className="w-full font-bold"
        >
          {isLoading ? "Creating Profile..." : "Create Mentor Profile"}
        </Button>
      </form>
    </div>
  );
};

export default MentorProfileForm;
