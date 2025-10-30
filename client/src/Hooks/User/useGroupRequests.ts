import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getGroupRequestsByUser,
  groupDetailsWithAdminId,
} from "../../Service/Group.Service";
import { RootState } from "../../redux/store";
import { GroupRequests as GroupReq, Group } from "../../redux/types";

export const useGroupRequests = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState<GroupReq[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  //fetch groups (admin) 
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const { groups = [] } = await groupDetailsWithAdminId(currentUser.id);
      setGroups(groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  // fetch join-requests
  const fetchGroupRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { requests = [] } = await getGroupRequestsByUser(currentUser.id);

      // hide requests for groups the user owns
      const filtered = requests.filter(
        (r) => r.groupId?.adminId !== currentUser.id
      );
      setGroupRequests(filtered);
    } catch (err) {
      console.error("Error fetching group requests:", err);
      toast.error("Failed to fetch group requests");
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  //initial load
  useEffect(() => {
    if (currentUser?.id) {
      fetchGroups();
      fetchGroupRequests();
    }
  }, [currentUser?.id, fetchGroups, fetchGroupRequests]);

  //refresh after payment
  const refresh = useCallback(() => {
    fetchGroupRequests();
  }, [fetchGroupRequests]);

  return {
    currentUser,
    groupRequests,
    groups,
    loading,
    refresh,
  };
};