import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getGroupDetails,
  getGroupRequestsByGroupId,
  updateGroupRequest,
  removeUserFromGroup,
  removeGroup,
  uploadGroupPicture,
} from "../../Service/Group.Service";
import { RootState } from "../../redux/store";
import { Group, GroupRequests as GroupReq } from "../../redux/types";

export const useGroupDashboard = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [group, setGroup] = useState<Group | null>(null);
  const [groupRequests, setGroupRequests] = useState<GroupReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);

      const [groupRes, requestsRes] = await Promise.all([
        getGroupDetails(groupId),
        getGroupRequestsByGroupId(groupId),
      ]);

      setGroup(groupRes.group || null);
      setGroupRequests(requestsRes.requests || []);
    } catch (err) {
      setError(err.message || "Failed to load group");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestUpdate = async (requestId: string, status: "Accepted" | "Rejected") => {
    if (isProcessing[requestId]) return;
    setIsProcessing((p) => ({ ...p, [requestId]: true }));

    try {
      const res = await updateGroupRequest(requestId, status);
      toast.success(res.message || `Request ${status.toLowerCase()}`);
      await fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update request");
    } finally {
      setIsProcessing((p) => ({ ...p, [requestId]: false }));
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromGroup({ groupId: groupId!, userId });
      toast.success("Member removed");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to remove member");
    }
  };

  const handleDeleteGroup = () => setIsDeleteModalOpen(true);
  const handleConfirmDelete = async () => {
    try {
      await removeGroup(groupId!);
      toast.success("Group deleted");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Failed to delete group");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;

    const formData = new FormData();
    formData.append(type === "profile" ? "profilePic" : "coverPic", file);

    try {
      await uploadGroupPicture(groupId, formData);
      toast.success(`${type === "profile" ? "Profile" : "Cover"} photo updated`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  const pendingCount = groupRequests.filter((r) => r.status === "Pending").length;

  return {
    group,
    groupRequests,
    loading,
    error,
    isProcessing,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    currentUser,
    pendingCount,
    handleRequestUpdate,
    handleRemoveUser,
    handleDeleteGroup,
    handleConfirmDelete,
    handlePhotoUpload,
    refresh: fetchData,
  };
};