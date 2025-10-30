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
import { Group, GroupRequests } from "../../redux/types";

export const useGroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [group, setGroup] = useState<Group | null>(null);
  const [groupRequests, setGroupRequests] = useState<GroupRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const res = await updateGroupRequest(requestId, status);
      toast.success(res.message || `Request ${status.toLowerCase()}`);
      await fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update request");
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

  const handleExitGroup = async () => {
    try {
      await removeUserFromGroup({ groupId: groupId!, userId: currentUser.id });
      toast.success("You have left the group");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Failed to exit group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
    try {
      await removeGroup(groupId!);
      toast.success("Group deleted");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message || "Failed to delete group");
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
      const res = await uploadGroupPicture(groupId, formData);
      setGroup((g) => ({
        ...g!,
        [type === "profile" ? "profilePic" : "coverPic"]: res.updatedGroup[type === "profile" ? "profilePic" : "coverPic"],
      }));
      toast.success(`${type === "profile" ? "Profile" : "Cover"} updated`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  const isAdmin = group?.adminId === currentUser.id;
  const pendingCount = groupRequests.filter(r => r.status === "Pending").length;
  const membersList = group?.membersDetails?.filter(m => m.user.id !== group.adminId) || [];

  return {
    group,
    groupRequests,
    loading,
    error,
    currentUser,
    isAdmin,
    pendingCount,
    membersList,
    handleRequestUpdate,
    handleRemoveUser,
    handleExitGroup,
    handleDeleteGroup,
    handlePhotoUpload,
    refresh: fetchData,
  };
};