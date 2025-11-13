import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupDetails,
  getGroupRequestDetails,
  removeGroup,
  removeUserFromGroup,
  updateGroupRequest,
} from "../../Service/Group.Service";
import toast from "react-hot-toast";
import { useDisclosure } from "@nextui-org/react";
import { Group, GroupRequests } from "../../redux/types";

export const useGroupDetails = () => {
  const { groupId, requestId } = useParams<{ groupId?: string; requestId?: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [request, setRequest] = useState<GroupRequests | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const fetchDetails = useCallback(async () => {
    try {
      if (groupId) {
        const groupData = await getGroupDetails(groupId);
        setGroup(groupData.group);
      } else if (requestId) {
        const requestData = await getGroupRequestDetails(requestId);
        console.log("Requset deatils : ",requestData);
        setRequest(requestData.request);
        setGroup(requestData.request.group);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId, requestId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const openModal = (title: string, description: string, action: () => void) => {
    setModalTitle(title);
    setModalDescription(description);
    setConfirmAction(() => action);
    onOpen();
  };

  const handleRemoveGroup = () => {
    if (!groupId) return;
    openModal("Delete Group", "Are you sure you want to delete this group?", async () => {
      try {
        await removeGroup(groupId);
        toast.success("Group deleted successfully!");
        navigate("/admin/groupManagemnt");
      } catch {
        toast.error("Failed to delete group");
      }
      onClose();
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (!groupId) return;
    openModal("Remove Member", "Are you sure you want to remove this member?", async () => {
      try {
        await removeUserFromGroup({ groupId, userId });
        toast.success("Member removed successfully");
        fetchDetails();
      } catch {
        toast.error("Failed to remove member");
      }
      onClose();
    });
  };

  const handleRequestUpdate = async (status: string) => {
    try {
      await updateGroupRequest(requestId!, status);
      toast.success(`Request ${status.toLowerCase()}`);
      navigate("/admin/groupManagemnt");
    } catch {
      toast.error("Failed to update request");
    }
  };

  return {
    group,
    request,
    loading,
    handleRemoveGroup,
    handleRemoveMember,
    handleRequestUpdate,
    modal: { isOpen, onClose, modalTitle, modalDescription, confirmAction },
  };
};
