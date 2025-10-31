import { useState, useEffect, useCallback, useMemo } from "react";
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
  Pagination,
  Input,
} from "@nextui-org/react";
import { FaEye, FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  blockUserService,
  getAllUsers,
  unblockUserService,
} from "../../Service/User.Service";
import { toast } from "react-hot-toast";
import { User as user } from "../../redux/types";
import debounce from "lodash.debounce";

const LIMIT = 10;
export interface UserListParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

const UserManagementList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<user[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); 
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(debouncedSearch && { search: debouncedSearch })
      };

      const data = await getAllUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page ?? page);
    } catch (err) {
      console.log(err)
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  const viewUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) await unblockUserService(userId);
      else await blockUserService(userId);
      toast.success(`User ${isBlocked ? "unblocked" : "blocked"}`);
      fetchUsers();
    } catch (err) {
      console.log(err)
      toast.error("Action failed");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Input
            placeholder="Search name, email, job..."
            startContent={<FaSearch className="text-gray-400" />}
            value={searchInput}
            onValueChange={(value) => {
              setSearchInput(value);
              debouncedSetSearch(value);
            }}
            className="pr-10"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* TABLE */}
      <Table
        isStriped
        aria-label="User management table"
        bottomContent={
          totalPages > 1 && (
            <div className="flex w-full justify-center mt-4">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>

        <TableBody
          items={users}
          isLoading={loading}
          loadingContent="Loading users..."
          emptyContent="No users found."
        >
          {(u) => (
            <TableRow key={u.id}>
              <TableCell>
                <User
                  avatarProps={{ radius: "lg", src: u.profilePic }}
                  name={u.name}
                  description={u.jobTitle}
                />
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Chip color={u.isBlocked ? "danger" : "success"} variant="flat">
                  {u.isBlocked ? "Blocked" : "Active"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    variant="light"
                    color="primary"
                    onPress={() => viewUserDetails(u.id)}
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
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementList;