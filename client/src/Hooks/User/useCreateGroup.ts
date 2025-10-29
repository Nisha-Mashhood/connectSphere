import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../../Service/Group.Service";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { GroupFormValues } from "../../validation/createGroupValidation";

export const useCreateGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async (data: GroupFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        adminId: currentUser.id,
        createdAt: new Date(),
        members: [currentUser.id],
      };

      await createGroup(payload);
      toast.success("Group created successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error(error?.message ?? "Failed to create group");
      console.error("Create group error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCreateGroup, isLoading };
};