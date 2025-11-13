import { Mentor } from "../../redux/types";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import MentorDetailModal from "../../Components/Admin/MentorDetails/MentorDetailModal";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../../Components/ReusableComponents/DataTable";
import { fetchMentorRequestsService } from "../../Service/Mentor.Service";
import SearchBar from "../../Components/ReusableComponents/SearchBar";

const LIMIT = 10;

const AdminMentorRequests: React.FC = () => {
  const [mentorRequests, setMentorRequests] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchMentorRequests = useCallback(async () => {
    try {
      const response = await fetchMentorRequestsService(page, LIMIT, search, statusFilter, "desc");
      setMentorRequests(response.mentors);
      setTotal(response.totalPages * LIMIT);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch mentor requests.");
    }
  },[page, search, statusFilter]);

  useEffect(() => {
    fetchMentorRequests();
  }, [fetchMentorRequests]);

  const handleMentorUpdate = (updatedMentor: Mentor) => {
    setMentorRequests((prev) =>
      prev.map((m) => (m.id === updatedMentor.id ? updatedMentor : m))
    );
  };

  const columns = [
    {
      key: "name",
      label: "Full Name",
      render: (m: Mentor) => m.user?.name || "Unknown User",
    },
    {
      key: "email",
      label: "Email",
      render: (m: Mentor) => m.user?.email || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (m: Mentor) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            m.isApproved === "Completed"
              ? "bg-green-100 text-green-800"
              : m.isApproved === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {m.isApproved}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (m: Mentor) => (
        <Button
          isIconOnly
          color="primary"
          variant="light"
          onPress={() => setSelectedMentor(m)}
        >
          <FaEye className="w-5 h-5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">Mentor Requests</h1>

        <div className="mb-4">
        <SearchBar
          activeTab="Users"
          searchQuery={search}
          setSearchQuery={setSearch}
          onSearchChange={setSearch}
        />
      </div>

        <DataTable
          data={mentorRequests}
          columns={columns}
          total={total}
          page={page}
          limit={LIMIT}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email..."
          topContent={
            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || "")}
              className="max-w-xs"
            >
              <SelectItem key="" value="">All</SelectItem>
              <SelectItem key="Processing">Processing</SelectItem>
              <SelectItem key="Completed">Approved</SelectItem>
              <SelectItem key="Rejected">Rejected</SelectItem>
            </Select>
          }
        />
      </div>

      {selectedMentor && (
        <MentorDetailModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onMentorUpdate={handleMentorUpdate}
        />
      )}
    </div>
  );
};

export default AdminMentorRequests;