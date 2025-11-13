import { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchUserDetails,
  updateUserRoleService,
  verifyAdminPasskey,
} from "../../Service/User.Service";
import { User, UserRole } from "../../redux/types";

export const useUserDetails = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await fetchUserDetails(userId);
        setUser(data.user);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load user");
        navigate("/admin/user");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, navigate]);

  const applyRoleChange = useCallback(
    async (newRole: UserRole) => {
      try {
        await updateUserRoleService(userId, newRole);
        setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
        toast.success(`Role updated to ${newRole}`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update role");
      }
    },
    [userId]
  );

  const updateUserRole = useMemo(
    () =>
      debounce(async (newRole: UserRole) => {
        if (!newRole || newRole === user?.role) return;

        if (newRole === "admin") {
          setPendingRole(newRole);
          setIsPasskeyModalOpen(true);
          return;
        }

        await applyRoleChange(newRole);
      }, 300),
    [user?.role, applyRoleChange]
  );

  const handlePasskeySubmit = async () => {
    if (!passkey.trim()) {
      toast.error("Passkey is required");
      return;
    }

    try {
      const isValid = await verifyAdminPasskey(passkey);
      if (!isValid) {
        toast.error("Invalid passkey");
        return;
      }

      await applyRoleChange(pendingRole as UserRole);
      setIsPasskeyModalOpen(false);
      setPasskey("");
      setPendingRole(null);
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
    }
  };

  return {
    user,
    loading,
    isPasskeyModalOpen,
    setIsPasskeyModalOpen,
    passkey,
    setPasskey,
    pendingRole,
    setPendingRole,
    updateUserRole,
    handlePasskeySubmit,
  };
};