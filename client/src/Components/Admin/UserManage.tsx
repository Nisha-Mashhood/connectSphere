import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchAllUsers, fetchUserDetails, updateUserRoleService, verifyAdminPasskey } from "../../Service/User.Service";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  // Fetch all users when the component mounts
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (error) {
        toast.error("Failed to fetch users");
      }
    };
    getUsers();
  }, []);

  // Fetch user details when a user is selected
  const getUserDetails = async (userId) => {
    try {
      const data = await fetchUserDetails(userId);
      setSelectedUser(data);
      setIsModalOpen(true); // Open modal after getting user details
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  // Block a user
  const blockUser = async(userId) => {
    try {
      await blockUser(userId);
      setUsers(users.map((user) =>
        user._id === userId ? { ...user, isBlocked: true } : user
      ));
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  // Unblock a user
  const unblockUser = async(userId) => {
    try {
      await unblockUser(userId);
      setUsers(users.map((user) =>
        user._id === userId ? { ...user, isBlocked: false } : user
      ));
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  // Update user role
  const updateUserRole = async (id,role) => {
    if (role === "admin") {
      // Prompt for admin passcode
      const passkey = prompt("Enter the admin passkey:");
      if (passkey) {
        try {
          const isValid = await verifyAdminPasskey(passkey);
          if (!isValid) {
            toast.error("Invalid admin passkey. Role update canceled.");
            return;
          }
        } catch (error) {
          toast.error("Failed to verify admin passkey. Role update canceled.");
          return;
        }
      } else {
        toast.error("Passkey entry canceled. Role update aborted.");
        return;
      }
    }

    try {
      await updateUserRoleService(id, role);
      toast.success("User role updated successfully");
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? { ...user, role } : user
        )
      );
      closeModal();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">User Management</h1>

      {/* User Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-6 py-4 text-left border-b">Name</th>
              <th className="px-6 py-4 text-left border-b">Email</th>
              <th className="px-6 py-4 text-left border-b">Phone</th>
              <th className="px-6 py-4 text-left border-b">Role</th>
              <th className="px-6 py-4 text-left border-b">Status</th>
              <th className="px-6 py-4 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors`}
              >
                <td className="px-6 py-4">
                  <a
                    href="#"
                    onClick={() => getUserDetails(user._id)} 
                    className="text-blue-500 hover:underline"
                  >{user.name}
                  </a>
                  </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phone}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded ${
                      user.isBlocked ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.isBlocked ? (
                    <button
                      onClick={() => unblockUser(user._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => blockUser(user._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Details</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Job Title:</strong> {selectedUser.jobTitle}</p>
              <p><strong>Industry:</strong> {selectedUser.industry}</p>
              <div>
              <p><strong>Role:</strong> 
              <select
                value={newRole}
                onChange={(e) => {
                  setNewRole(e.target.value);
                  updateUserRole(selectedUser._id, e.target.value);
                }}
                className="w-full border-gray-300 rounded-md shadow-sm mt-2"
              >
                <option value="user">User</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
              </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManage;
