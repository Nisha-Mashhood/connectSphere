import { User as user } from "../../redux/types";
import { FaEye } from "react-icons/fa";
import { Button, User, Chip, Select, SelectItem } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { blockUserService, getAllUsers, unblockUserService } from "../../Service/User.Service";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../../Components/ReusableComponents/DataTable";
import SearchBar from "../../Components/ReusableComponents/SearchBar";
import { SlidersHorizontal } from "lucide-react";

const LIMIT = 10;

const UserManagementList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<user[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockStatusFilter, setBlockStatusFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...(search && { search }), ...(blockStatusFilter && { status: blockStatusFilter }) };
      console.log("Params : ",params);
      const data = await getAllUsers(params);
      console.log("User data : ",data);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  },[page, search, blockStatusFilter]);

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

      {/* Enhanced Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar
              activeTab="Users"
              searchQuery={search}
              setSearchQuery={setSearch}
              onSearchChange={setSearch}
            />
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Filter:</span>
            </div>
            <Select
              placeholder="Status"
              selectedKeys={blockStatusFilter ? [blockStatusFilter] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string || "";
                setBlockStatusFilter(value);
                setPage(1);
              }}
              className="w-40"
              size="md"
              classNames={{
                trigger: "bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors",
              }}
            >
              <SelectItem key="">All Status</SelectItem>
              <SelectItem key="active">Active</SelectItem>
              <SelectItem key="blocked">Blocked</SelectItem>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || blockStatusFilter) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {search && (
              <Chip
                size="sm"
                variant="flat"
                onClose={() => setSearch("")}
                classNames={{
                  base: "bg-blue-50 text-blue-700",
                  closeButton: "text-blue-700",
                }}
              >
                Search: "{search}"
              </Chip>
            )}
            {blockStatusFilter && (
              <Chip
                size="sm"
                variant="flat"
                onClose={() => {
                  setBlockStatusFilter("");
                  setPage(1);
                }}
                classNames={{
                  base: "bg-purple-50 text-purple-700",
                  closeButton: "text-purple-700",
                }}
              >
                Status: {blockStatusFilter === "active" ? "Active" : "Blocked"}
              </Chip>
            )}
          </div>
        )}
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