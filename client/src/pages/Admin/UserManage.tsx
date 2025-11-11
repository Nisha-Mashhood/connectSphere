import { User as user } from "../../redux/types";
import { FaEye } from "react-icons/fa";
import { Button, User, Chip } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { blockUserService, getAllUsers, unblockUserService } from "../../Service/User.Service";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../../Components/ReusableComponents/DataTable";
import SearchBar from "../../Components/ReusableComponents/SearchBar";

const LIMIT = 10;

const UserManagementList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<user[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...(search && { search }) };
      const data = await getAllUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  },[page, search]);

  useEffect(() => {
    fetchUsers();
  }, [page, search, fetchUsers]);

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) await unblockUserService(userId);
      else await blockUserService(userId);
      toast.success(`User ${isBlocked ? "unblocked" : "blocked"}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: !isBlocked } : u))
      );
    } catch (err) {
      console.log(err);
      toast.error("Action failed");
    }
  };

  const columns = [
    {
      key: "user",
      label: "USER",
      render: (u: user) => (
        <User
          avatarProps={{ radius: "lg", src: u.profilePic }}
          name={u.name}
          description={u.jobTitle}
        />
      ),
    },
    { key: "email", label: "EMAIL" },
    { key: "role", label: "ROLE" },
    {
      key: "status",
      label: "STATUS",
      render: (u: user) => (
        <Chip color={u.isBlocked ? "danger" : "success"} variant="flat">
          {u.isBlocked ? "Blocked" : "Active"}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (u: user) => (
        <div className="flex gap-2">
          <Button
            isIconOnly
            variant="light"
            color="primary"
            onPress={() => navigate(`/admin/users/${u.id}`)}
          >
            <FaEye />
          </Button>
          <Button
            size="sm"
            color={u.isBlocked ? "success" : "danger"}
            variant="flat"
            onPress={() => toggleUserBlock(u.id, u.isBlocked)}
          >
            {u.isBlocked ? "Unblock" : "Block"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="mb-4">
        <SearchBar
          activeTab="Users"
          searchQuery={search}
          setSearchQuery={setSearch}
          onSearchChange={setSearch}
        />
      </div>


      <DataTable
        data={users}
        columns={columns}
        total={total}
        page={page}
        limit={LIMIT}
        onPageChange={setPage}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, job..."
      />
    </div>
  );
};

export default UserManagementList;