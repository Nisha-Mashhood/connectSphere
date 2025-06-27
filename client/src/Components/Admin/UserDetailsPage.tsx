import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardBody,  
  Chip, 
  Button,
  Select,
  SelectItem,
  Avatar
} from "@nextui-org/react";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchUserDetails, 
  updateUserRoleService, 
  verifyAdminPasskey 
} from "../../Service/User.Service";
import { toast } from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaEnvelope,  
  FaUserTie, 
} from "react-icons/fa";
import { debounce } from 'lodash';

const UserDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const navigate = useNavigate();

 // Define debounced updateUserRole
  const updateUserRole = useMemo(
    () =>
      debounce(async (newRole) => {
        // console.log('updateUserRole called with:', newRole); // Debug log
        if (!newRole) {
          console.log('No role selected, aborting');
          return;
        }

        if (newRole === "admin") {
          const passkey = prompt("Enter the admin passkey:");
          if (!passkey) {
            toast.error("Passkey entry canceled. Role update aborted.");
            return;
          }

          try {
            const isValid = await verifyAdminPasskey(passkey);
            if (!isValid) {
              toast.error("Invalid admin passkey. Role update canceled.");
              return;
            }
          } catch (error) {
            console.log(error);
            toast.error("Failed to verify admin passkey. Role update canceled.");
            return;
          }
        }

        try {
          await updateUserRoleService(user._id, newRole);
          setUser((prev) => ({ ...prev, role: newRole }));
          toast.success(`User role updated to ${newRole}`);
        } catch (error) {
          console.log(error);
          toast.error("Failed to update user role");
        }
      }, 300),
    [user?._id]
  );

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userData = await fetchUserDetails(userId);
        setUser(userData.user);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch user details");
        navigate('/admin/user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Button 
        color="primary" 
        variant="light" 
        onClick={() => navigate('/admin/user')}
        className="mb-6 flex items-center gap-2"
      >
        <FaArrowLeft /> Back to User List
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <Card className="md:col-span-1 shadow-md">
          <CardBody className="items-center text-center p-6">
            <div className="relative mb-4">
              <Avatar 
                src={user.profilePic || '/default-profile.png'}
                className="w-36 h-36 text-large border-4 border-primary-500"
                isBordered
                color="primary"
              />
              <Chip 
                color={user.isBlocked ? "danger" : "success"} 
                variant="flat" 
                className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"
                size="sm"
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </Chip>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h1>
            <p className="text-gray-500 mb-4">{user.jobTitle || 'No Job Title'}</p>

            <div className="w-full mt-4">
              <Select
                label="User Role"
                selectedKeys={[user.role]}
                onChange={(e) => updateUserRole(e.target.value)}
                className="w-full"
                variant="bordered"
              >
                <SelectItem key="user" textValue="User">User</SelectItem>
                <SelectItem key="mentor" textValue="Mentor">Mentor</SelectItem>
                <SelectItem key="admin" textValue="Admin">Admin</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Details Section */}
        <Card className="md:col-span-2 shadow-md">
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3 border-b pb-2">
                  <FaEnvelope className="text-primary-500" />
                  Personal Information
                </h2>
                <div className="space-y-3 pl-8">
                  <div>
                    <p className="text-gray-600 font-medium">Email Address</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Phone Number</p>
                    <p className="text-gray-800">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Date of Birth</p>
                    <p className="text-gray-800">
                      {user.dateOfBirth 
                        ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) 
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3 border-b pb-2">
                  <FaUserTie className="text-primary-500" />
                  Professional Information
                </h2>
                <div className="space-y-3 pl-8">
                  <div>
                    <p className="text-gray-600 font-medium">Job Title</p>
                    <p className="text-gray-800">{user.jobTitle || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Industry</p>
                    <p className="text-gray-800">{user.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Reason for Joining</p>
                    <p className="text-gray-800">
                      {user.reasonForJoining || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailsPage;

