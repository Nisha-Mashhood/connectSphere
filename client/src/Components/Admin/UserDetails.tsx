import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Select,
  SelectItem,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Spinner,
} from "@nextui-org/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserDetails,
  updateUserRoleService,
  verifyAdminPasskey,
} from "../../Service/User.Service";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaEnvelope, FaUserTie, FaLock } from "react-icons/fa";
import { debounce } from "lodash";
import { User, UserRole } from "../../redux/types";

const UserDetailsPage = () => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  const applyRoleChange = useCallback(async (newRole:UserRole) => {
    try {
      await updateUserRoleService(userId, newRole);
      setUser((prev) => ({ ...prev, role: newRole }));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  },[userId]);

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

      await applyRoleChange(pendingRole);
      setIsPasskeyModalOpen(false);
      setPasskey("");
      setPendingRole(null);
    } catch (error) {
      console.log(error);
      toast.error("Verification failed");
    }
  };

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await fetchUserDetails(userId);
        console.log(data);
        setUser(data.user);
      } catch (error) {
        console.log(error)
        toast.error("Failed to load user");
        navigate("/admin/user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const formatDate = (date: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not provided";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-danger">User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Floating Back Button */}
          <Button
            color="primary"
            variant="light"
            onPress={() => navigate("/admin/user")}
            startContent={<FaArrowLeft />}
            className="mb-6 shadow-md"
          >
            Back to Users
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Profile Card */}
            <Card className="h-fit shadow-lg border border-gray-200">
              <CardBody className="p-8 text-center space-y-6">
                {/* Avatar with Status Badge */}
                <div className="relative inline-block">
                  <Avatar
                    src={user.profilePic || "/default-profile.png"}
                    className="w-40 h-40 text-large"
                    isBordered
                    color="primary"
                  />
                  <Chip
                    color={user.isBlocked ? "danger" : "success"}
                    variant="flat"
                    size="sm"
                    className="absolute -bottom-2 -right-2 shadow-md"
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </Chip>
                </div>

                {/* Name & Title */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                  <p className="text-gray-500 mt-1">{user.jobTitle || "No job title"}</p>
                </div>

                {/* Role Selector */}
                <Select
                  label="User Role"
                  selectedKeys={[user.role]}
                  onChange={(e) => updateUserRole(e.target.value as UserRole)}
                  startContent={<FaUserTie className="text-gray-400" />}
                  className="max-w-xs mx-auto"
                  variant="bordered"
                  color="primary"
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="mentor">Mentor</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* Right: Details Card */}
            <Card className="lg:col-span-2 shadow-lg border border-gray-200">
              <CardBody className="p-8 space-y-8">
                {/* Personal Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                    <FaEnvelope className="text-primary-600" />
                    Personal Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-800 break-all">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-800">{user.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                      <p className="text-gray-800">{formatDate(user.dateOfBirth)}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                    <FaUserTie className="text-emerald-600" />
                    Professional Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Job Title</p>
                      <p className="text-gray-800">{user.jobTitle || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Industry</p>
                      <p className="text-gray-800">{user.industry || "Not specified"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Reason for Joining</p>
                      <p className="text-gray-800 italic">
                        {user.reasonForJoining || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Passkey Modal */}
      <Modal
        isOpen={isPasskeyModalOpen}
        onOpenChange={setIsPasskeyModalOpen}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FaLock className="text-warning" />
            Admin Passkey Required
          </ModalHeader>
          <ModalBody>
            <Input
              label="Enter admin passkey"
              placeholder="••••••••"
              type="password"
              value={passkey}
              onValueChange={setPasskey}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsPasskeyModalOpen(false);
                setPasskey("");
                setPendingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handlePasskeySubmit}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserDetailsPage;