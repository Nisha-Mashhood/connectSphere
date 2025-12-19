import { useCallback, useState } from "react";
import {
  addMentorExperience,
  deleteMentorExperience,
  getMentorExperiences,
  updateMentorExperience,
} from "../../Service/Mentor.Service";
import { IMentorExperience } from "../../Interface/Admin/IMentor";
import toast from "react-hot-toast";
import { useDisclosure } from "@nextui-org/react";

interface UseExperienceSectionProps {
  mentorId: string | undefined;
  userId: string | undefined;
}

//Normalize the backend data
const normalizeExperience = (exp: IMentorExperience): IMentorExperience => {
  const normalize = (value?: string | Date | null) => {
    if (!value) return null;
    if (value instanceof Date) {
      return value.toISOString().slice(0, 7);
    }
    if (typeof value === "string") {
      return value.slice(0, 7);
    }
    return null;
  };
  return {
    ...exp,
    startDate: normalize(exp.startDate),
    endDate: normalize(exp.endDate),
  };
};

    // Full date validation
    const validateExperienceDates = (
    data: IMentorExperience,
    experiences: IMentorExperience[],
    ignoreId?: string
    ): string | null => {

    const start = new Date(`${data.startDate}-01`);
    const end = data.endDate ? new Date(`${data.endDate}-01`) : null;
    const now = new Date();

    // Overlap check
    const overlap = experiences.some((exp) => {
        if (ignoreId && exp.id === ignoreId) return false;
        const expStart = new Date(`${exp.startDate}-01`);
        const expEnd = exp.endDate ? new Date(`${exp.endDate}-01`) : now;
        const currentEnd = end ?? now;
        return start <= expEnd && currentEnd >= expStart;
    });
    if (overlap) {
        return "This experience overlaps with an existing time period";
    }
    return null;
    };

    export const useExperienceSection = ({
    mentorId,
    userId,
    }: UseExperienceSectionProps) => {
    const [experiences, setExperiences] = useState<IMentorExperience[]>([]);
    const [loadingExperiences, setLoadingExperiences] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    const {
        isOpen: isExperienceModalOpen,
        onOpen: onExperienceModalOpen,
        onClose: onExperienceModalClose,
    } = useDisclosure();

    const {
        isOpen: isDeleteModalOpen,
        onOpen: onDeleteModalOpen,
        onClose: onDeleteModalClose,
    } = useDisclosure();

    const [selectedExperience, setSelectedExperience] =
        useState<IMentorExperience | null>(null);

    const [editingExperienceId, setEditingExperienceId] = useState<string | null>(
        null
    );

    const [experienceToDelete, setExperienceToDelete] = useState<string | null>(
        null
    );

  //Fetch experiences
  const fetchExperiences = useCallback(async () => {
    if (!mentorId) return;

    setLoadingExperiences(true);
    try {
      const res = await getMentorExperiences(mentorId);
      const normalized = (res.experiences || []).map(normalizeExperience);
      setExperiences(normalized);
      console.log(normalized);
    } catch (error) {
      console.error("Failed to fetch experiences", error);
      toast.error("Failed to load experiences");
      setExperiences([]);
    } finally {
      setLoadingExperiences(false);
    }
  }, [mentorId]);

    //Accordion handler
  const handleExpansionChange = (keys: "all" | Set<React.Key> | string[]) => {
    let newKeys: string[] = [];
    if (keys === "all") {
      newKeys = ["experience"];
    } else if (keys instanceof Set) {
      newKeys = Array.from(keys).filter(
        (k): k is string => typeof k === "string"
      );
    } else {
      newKeys = keys.filter((k): k is string => typeof k === "string");
    }
    setExpandedKeys(newKeys);
    if (
      newKeys.includes("experience") &&
      experiences.length === 0 &&
      !loadingExperiences
    ) {
      fetchExperiences();
    }
  };


  const handleOpenAddModal = () => {
    setSelectedExperience(null);
    setEditingExperienceId(null);
    onExperienceModalOpen();
  };

  const handleOpenEditModal = (exp: IMentorExperience) => {
    setEditingExperienceId(exp.id);
    setSelectedExperience(exp);
    onExperienceModalOpen();
  };

  //Save (Add / Update)
  const handleSaveExperience = async (data: IMentorExperience) => {
    if (!userId) return;

    const payload = {
      ...data,
      endDate: data.isCurrent ? null : data.endDate,
    };
    const validationError = validateExperienceDates(
      payload,
      experiences,
      editingExperienceId || undefined
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      if (editingExperienceId) {
        // UPDATE
        const res = await updateMentorExperience(
          userId,
          editingExperienceId,
          payload
        );
        const updatedExperience = normalizeExperience(res.experience);

        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === editingExperienceId ? updatedExperience : exp
          )
        );
        toast.success("Experience updated successfully");
      } else {
        // ADD
        const res = await addMentorExperience(userId, payload);
        const created = normalizeExperience(res.experience ?? res);

        setExperiences((prev) => [...prev, created]);
        toast.success("Experience added successfully");
      }
      setSelectedExperience(null);
      setEditingExperienceId(null);
      onExperienceModalClose();
    } catch (error) {
      console.error("Failed to save experience", error);
      toast.error("Failed to save experience");
    }
  };

  // Delete flow
  const handleDeleteClick = (id: string) => {
    setExperienceToDelete(id);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!experienceToDelete || !userId) return;

    try {
      await deleteMentorExperience(userId, experienceToDelete);

      setExperiences((prev) =>
        prev.filter((exp) => exp.id !== experienceToDelete)
      );

      toast.success("Experience deleted successfully");
    } catch (error) {
      console.error("Failed to delete experience", error);
      toast.error("Failed to delete experience");
    } finally {
      setExperienceToDelete(null);
      onDeleteModalClose();
    }
  };

  return {
    experiences,
    loadingExperiences,
    expandedKeys,
    handleExpansionChange,
    isExperienceModalOpen,
    onExperienceModalClose,
    isDeleteModalOpen,
    onDeleteModalClose,
    selectedExperience,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveExperience,
    handleDeleteClick,
    confirmDelete,
  };
};
