import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  User, 
  Chip, 
  Button,
  Pagination
} from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { 
  blockUserService, 
  fetchAllUsers, 
  unblockUserService 
} from "../../Service/User.Service";
import { toast } from "react-hot-toast";

const UserManagementList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const rowsPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchAllUsers();
        console.log("Users: ",data);
        setUsers(data);
      } catch (error) {
        console.log(error)
        toast.error("Failed to fetch users");
      }
    };
    getUsers();
  }, []);

  // Navigate to user details
  const viewUserDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  // Block/Unblock user
  const toggleUserBlock = async (userId, currentBlockStatus) => {
    try {
      if (currentBlockStatus) {
        await unblockUserService(userId);
      } else {
        await blockUserService(userId);
      }
      // Refresh user list
      const updatedUsers = await fetchAllUsers();
      setUsers(updatedUsers);
      toast.success(`User ${currentBlockStatus ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      console.log(error)
      toast.error(`Failed to ${currentBlockStatus ? 'unblock' : 'block'} user`);
    }
  };

  // Pagination logic
  const pages = Math.ceil(users.length / rowsPerPage);
  const paginatedUsers = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return users.slice(start, end);
  }, [page, users]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Table 
        aria-label="User management table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No users to display."}>
          {paginatedUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <User
                  avatarProps={{ radius: "lg", src: user.profilePic }}
                  description={user.jobTitle}
                  name={user.name}
                />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Chip 
                  color={user.isBlocked ? "danger" : "success"}
                  variant="flat"
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    isIconOnly 
                    variant="light" 
                    color="primary"
                    onPress={() => viewUserDetails(user._id)}
                  >
                    <FaEye />
                  </Button>
                  <Button 
                    size="sm" 
                    color={user.isBlocked ? "success" : "danger"}
                    variant="flat"
                    onPress={() => toggleUserBlock(user._id, user.isBlocked)}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementList;